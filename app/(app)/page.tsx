import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Boxes,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Sparkles,
  SplitSquareHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { StatCard } from "@/components/StatCard";
import { FeatureCard } from "@/components/FeatureCard";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [{ data: profileRow }, { data: txnRows }] = await Promise.all([
    supabase.from("profiles").select("monthly_budget").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("id, amount, category, note, date")
      .eq("user_id", user.id)
      .gte("date", monthStartStr)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const monthlyBudget = Number(profileRow?.monthly_budget ?? 0);
  const transactions = txnRows ?? [];
  const monthSpend = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const budgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((monthSpend / monthlyBudget) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <Logo />
      </div>

      <div className="px-5 pt-2">
        <h1 className="text-2xl font-bold text-caddy-ink">Good to see you 👋</h1>
        <p className="text-sm text-caddy-gray">Here&rsquo;s how your spending is going this month.</p>
      </div>

      <div className="mt-5 flex gap-3 px-5">
        <Link
          href="/list"
          className="flex flex-1 items-center justify-between rounded-xl2 bg-caddy-orange px-4 py-3.5 text-white shadow-floating"
        >
          <span>
            <span className="block text-sm font-semibold">Build my list</span>
            <span className="block text-xs text-white/80">Plan it, total it</span>
          </span>
          <ShoppingBag size={20} />
        </Link>
        <Link
          href="/chat"
          className="flex flex-1 items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white px-4 py-3.5 text-caddy-ink shadow-card"
        >
          <span>
            <span className="block text-sm font-semibold">Ask ShopCaddy</span>
            <span className="block text-xs text-caddy-gray">Log spend, get tips</span>
          </span>
          <Sparkles size={20} className="text-caddy-orange" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 px-5">
        <StatCard label="Spent this month" value={`£${monthSpend.toFixed(0)}`} icon={Wallet} />
        <StatCard
          label="Budget left"
          value={`£${Math.max(0, monthlyBudget - monthSpend).toFixed(0)}`}
          icon={PiggyBank}
          tone="orange"
        />
        <StatCard label="Logged" value={`${transactions.length}`} icon={Receipt} />
      </div>

      <div className="mx-5 mt-5 rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-caddy-ink">Monthly budget</span>
          <span className="text-caddy-gray">
            £{monthSpend.toFixed(0)} / £{monthlyBudget.toFixed(0)}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-caddy-orange-light">
          <div
            className={`h-full rounded-full transition-all ${
              monthSpend > monthlyBudget ? "bg-red-500" : "bg-caddy-orange"
            }`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-caddy-gray">
          {monthSpend <= monthlyBudget
            ? `On track — ${100 - budgetPct}% of budget left.`
            : "Heads up, you're over your monthly budget."}
        </p>
      </div>

      <div className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-caddy-ink">On the roadmap</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FeatureCard
            icon={Boxes}
            badge="Coming soon"
            title="Pantry &amp; wardrobe tracker"
            description="Knows what you already have so it never suggests duplicates."
          />
          <FeatureCard
            icon={Bell}
            badge="Coming soon"
            title="Price-drop alerts"
            description="Watches items you buy often and pings you when they get cheaper."
          />
          <FeatureCard
            icon={SplitSquareHorizontal}
            badge="Coming soon"
            title="Multi-store baskets"
            description="Splits one list across retailers automatically for the lowest total."
          />
          <FeatureCard
            icon={Users}
            badge="Coming soon"
            title="Household sharing"
            description="Everyone at home adds to one shared list and budget."
          />
        </div>
      </div>

      <div className="mt-6 px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-caddy-ink">Recent activity</h2>
          <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-caddy-orange-dark">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-caddy-gray">
            Nothing logged yet this month — tell ShopCaddy what you spent in Chat, or add a spend
            in Budget.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-caddy-ink">
                    {t.note ?? t.category}
                  </p>
                  <p className="text-xs text-caddy-gray">{t.category}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-caddy-ink">£{Number(t.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
