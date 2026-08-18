"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Sparkles, Wallet } from "lucide-react";
import { updateMonthlyBudget, upsertBudget } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";
import { CategoryBudget } from "@/types";

export function AccountSettings({
  email,
  monthlyBudget,
  budgets,
}: {
  email: string;
  monthlyBudget: number;
  budgets: CategoryBudget[];
}) {
  const router = useRouter();
  const [overallInput, setOverallInput] = useState(String(monthlyBudget));
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const c of BUDGET_CATEGORIES) {
      map[c] = String(budgets.find((b) => b.category === c)?.monthlyLimit ?? "");
    }
    return map;
  });
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="pb-6">
      <div className="mx-5 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
              <Wallet size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-caddy-ink">{email}</p>
              <p className="text-xs text-caddy-gray">Signed in</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl2 border border-caddy-orange-light px-4 py-2.5 text-sm font-semibold text-caddy-gray hover:border-caddy-orange hover:text-caddy-orange-dark disabled:opacity-60"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <p className="mb-2 text-sm font-semibold text-caddy-ink">Monthly budget</p>
          <div className="flex items-center gap-2">
            <span className="text-caddy-gray">£</span>
            <input
              type="number"
              min="0"
              value={overallInput}
              onChange={(e) => setOverallInput(e.target.value)}
              onBlur={() => {
                const n = Number(overallInput);
                if (n >= 0) updateMonthlyBudget(n).then(() => router.refresh());
              }}
              className="w-full rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
            />
          </div>
          <p className="mt-2 text-xs text-caddy-gray">
            ShopCaddy flags it on Home and in Chat when you're close to going over.
          </p>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card md:col-span-2">
          <p className="mb-3 text-sm font-semibold text-caddy-ink">Budget by category</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BUDGET_CATEGORIES.map((category) => (
              <div key={category}>
                <label className="mb-1 block text-xs font-medium text-caddy-gray">{category}</label>
                <div className="flex items-center gap-2">
                  <span className="text-caddy-gray">£</span>
                  <input
                    type="number"
                    min="0"
                    value={categoryInputs[category]}
                    onChange={(e) => setCategoryInputs({ ...categoryInputs, [category]: e.target.value })}
                    onBlur={() => {
                      const n = Number(categoryInputs[category]);
                      if (n >= 0) upsertBudget({ category, monthlyLimit: n }).then(() => router.refresh());
                    }}
                    placeholder="Not set"
                    className="w-full rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card md:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Bell size={16} className="text-caddy-orange-dark" />
            <p className="text-sm font-semibold text-caddy-ink">Notifications</p>
            <span className="rounded-full bg-caddy-ink px-2 py-0.5 text-[10px] font-semibold text-white">
              Coming soon
            </span>
          </div>
          <p className="text-xs text-caddy-gray">
            Price-drop alerts and budget warnings by email are on the roadmap — not wired up yet.
          </p>
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl2 bg-caddy-orange-light/70 p-4 text-xs text-caddy-orange-dark">
        <Sparkles size={16} className="shrink-0" />
        ShopCaddy's catalog is a curated, indicative price panel — not a live retailer feed. Buy
        links take you to the retailer's own site to complete your purchase.
      </div>
    </div>
  );
}
