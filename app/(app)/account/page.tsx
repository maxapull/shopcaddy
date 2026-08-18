import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { AccountSettings } from "@/components/AccountSettings";
import { CategoryBudget } from "@/types";

interface BudgetRow {
  id: string;
  category: string;
  monthly_limit: number;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profileRow }, { data: budgetRows }] = await Promise.all([
    supabase.from("profiles").select("monthly_budget").eq("id", user.id).single(),
    supabase.from("budgets").select("*").eq("user_id", user.id),
  ]);

  const budgets: CategoryBudget[] = ((budgetRows as BudgetRow[]) ?? []).map((b) => ({
    id: b.id,
    category: b.category,
    monthlyLimit: Number(b.monthly_limit),
  }));

  return (
    <div className="pb-6">
      <TopBar title="Account" subtitle="Budget and settings" />
      <AccountSettings
        email={user.email ?? ""}
        monthlyBudget={Number(profileRow?.monthly_budget ?? 0)}
        budgets={budgets}
      />
    </div>
  );
}
