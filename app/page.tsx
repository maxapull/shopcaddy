"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Boxes,
  PiggyBank,
  Receipt,
  Shirt,
  ShoppingBag,
  Sparkles,
  SplitSquareHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { StatCard } from "@/components/StatCard";
import { FeatureCard } from "@/components/FeatureCard";
import { useAppState } from "@/lib/store";

export default function HomePage() {
  const { monthSpend, monthSaved, monthlyBudget, orders, bankLinked } = useAppState();
  const budgetPct = Math.min(100, Math.round((monthSpend / monthlyBudget) * 100));

  return (
    <div>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <Logo />
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            bankLinked ? "bg-green-100 text-green-700" : "bg-caddy-orange-light text-caddy-orange-dark"
          }`}
        >
          {bankLinked ? "Bank linked" : "Bank not linked"}
        </span>
      </div>

      <div className="px-5 pt-2">
        <h1 className="text-2xl font-bold text-caddy-ink">Good to see you 👋</h1>
        <p className="text-sm text-caddy-gray">
          Here&rsquo;s how your food and clothes shopping is going this month.
        </p>
      </div>

      <div className="mt-5 flex gap-3 px-5">
        <Link
          href="/list"
          className="flex flex-1 items-center justify-between rounded-xl2 bg-caddy-orange px-4 py-3.5 text-white shadow-floating"
        >
          <span>
            <span className="block text-sm font-semibold">Build my list</span>
            <span className="block text-xs text-white/80">AI list + prices</span>
          </span>
          <ShoppingBag size={20} />
        </Link>
        <Link
          href="/chat"
          className="flex flex-1 items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white px-4 py-3.5 text-caddy-ink shadow-card"
        >
          <span>
            <span className="block text-sm font-semibold">Chat &amp; buy</span>
            <span className="block text-xs text-caddy-gray">Ask ShopCaddy</span>
          </span>
          <Sparkles size={20} className="text-caddy-orange" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 px-5">
        <StatCard label="Spent this month" value={`£${monthSpend.toFixed(0)}`} icon={Wallet} />
        <StatCard label="Saved by AI" value={`£${monthSaved.toFixed(0)}`} icon={PiggyBank} tone="orange" />
        <StatCard label="Orders placed" value={`${orders.length}`} icon={Receipt} />
      </div>

      <div className="mx-5 mt-5 rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-caddy-ink">Monthly budget</span>
          <span className="text-caddy-gray">
            £{monthSpend.toFixed(0)} / £{monthlyBudget}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-caddy-orange-light">
          <div
            className="h-full rounded-full bg-caddy-orange transition-all"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-caddy-gray">
          {budgetPct < 90
            ? `On track — ${100 - budgetPct}% of budget left.`
            : "Heads up, you're close to your monthly budget."}
        </p>
      </div>

      <div className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-caddy-ink">More ways ShopCaddy helps</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={Boxes}
            badge="Beta"
            title="Pantry &amp; wardrobe tracker"
            description="Knows what you already have so it never adds duplicates to your list."
          />
          <FeatureCard
            icon={Bell}
            title="Price-drop alerts"
            description="Watches items you buy often and pings you when they get cheaper."
          />
          <FeatureCard
            icon={SplitSquareHorizontal}
            title="Multi-store baskets"
            description="Splits one list across retailers automatically for the lowest total."
          />
          <FeatureCard
            icon={Users}
            title="Household sharing"
            description="Everyone at home can add to one shared list and budget."
          />
        </div>
      </div>

      <div className="mt-6 px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-caddy-ink">Recent orders</h2>
          <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold text-caddy-orange-dark">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {orders.slice(0, 2).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
                  <Shirt size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-caddy-ink">{order.productName}</p>
                  <p className="text-xs text-caddy-gray">{order.retailer}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-caddy-ink">£{order.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
