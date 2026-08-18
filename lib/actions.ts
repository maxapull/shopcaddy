"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

// --- Transactions -----------------------------------------------------------
// Every transaction is entered by the user, either directly on /orders or via
// a "log this" confirmation in Chat — there is no product catalog and
// nothing is ever logged automatically.

const transactionSchema = z.object({
  amount: z.coerce.number().min(0).max(1_000_000),
  category: z.string().trim().min(1).max(60),
  note: z.string().trim().max(200).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export async function addTransaction(input: unknown): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    note: parsed.data.note || null,
    date: parsed.data.date,
  });
  if (error) return { success: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

const updateTransactionSchema = transactionSchema.extend({ id: z.string().uuid() });

export async function updateTransaction(input: unknown): Promise<ActionResult> {
  const parsed = updateTransactionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { id, ...fields } = parsed.data;
  const { error } = await supabase
    .from("transactions")
    .update({ ...fields, note: fields.note || null })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { success: false, error: "Invalid id." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath("/");
  return { success: true };
}

// --- Budgets -----------------------------------------------------------------

const budgetSchema = z.object({
  category: z.string().trim().min(1).max(60),
  monthlyLimit: z.coerce.number().min(0).max(1_000_000),
});

export async function upsertBudget(input: unknown): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase
    .from("budgets")
    .upsert(
      { user_id: user.id, category: parsed.data.category, monthly_limit: parsed.data.monthlyLimit },
      { onConflict: "user_id,category" }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/orders");
  return { success: true };
}

export async function updateMonthlyBudget(amount: unknown): Promise<ActionResult> {
  const parsed = z.coerce.number().min(0).max(10_000_000).safeParse(amount);
  if (!parsed.success) return { success: false, error: "Invalid amount." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ monthly_budget: parsed.data })
    .eq("id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/");
  return { success: true };
}

// --- Shopping lists ------------------------------------------------------------
// Every item is typed in by the user — there's no catalog behind this,
// ShopCaddy just organises and totals what you enter.

const saveListSchema = z.object({
  title: z.string().trim().min(1).max(200),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        category: z.string().trim().min(1).max(60),
        price: z.coerce.number().min(0).max(1_000_000),
        quantity: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1),
});

export async function saveShoppingList(input: unknown): Promise<ActionResult> {
  const parsed = saveListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { supabase, user } = await requireUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .insert({ user_id: user.id, title: parsed.data.title })
    .select("id")
    .single();
  if (listError || !list) return { success: false, error: listError?.message ?? "Could not save list." };

  const { error: itemsError } = await supabase.from("shopping_list_items").insert(
    parsed.data.items.map((item) => ({
      list_id: list.id,
      user_id: user.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
    }))
  );
  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/list");
  return { success: true };
}
