import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { TransactionsManager } from "@/components/TransactionsManager";
import { CategoryBudget, Transaction } from "@/types";

interface TransactionRow {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

interface BudgetRow {
  id: string;
  category: string;
  monthly_limit: number;
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  };
}

function mapBudget(row: BudgetRow): CategoryBudget {
  return { id: row.id, category: row.category, monthlyLimit: Number(row.monthly_limit) };
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: txnRows }, { data: budgetRows }, { data: profileRow }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase.from("profiles").select("monthly_budget").eq("id", user.id).single(),
  ]);

  return (
    <div className="pb-6">
      <TopBar title="Budget" subtitle="Everything you've logged, and how it's tracking" />
      <TransactionsManager
        transactions={((txnRows as TransactionRow[]) ?? []).map(mapTransaction)}
        budgets={((budgetRows as BudgetRow[]) ?? []).map(mapBudget)}
        monthlyBudget={Number(profileRow?.monthly_budget ?? 0)}
      />
    </div>
  );
}
