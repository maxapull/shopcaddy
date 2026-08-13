"use client";

import { useState } from "react";
import { Bell, Building2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BankLinkSheet } from "@/components/BankLinkSheet";
import { useAppState } from "@/lib/store";

const HOUSEHOLD = [
  { initials: "MP", name: "You", role: "Owner" },
  { initials: "JS", name: "Jamie", role: "Member" },
];

export default function AccountPage() {
  const { bankLinked, bankName, unlinkBank, monthlyBudget, setBudget } = useAppState();
  const [showBankSheet, setShowBankSheet] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));

  return (
    <div className="pb-6">
      <TopBar title="Account" subtitle="Bank, budget and household settings" />

      <div className="mx-5 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
              <Building2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-caddy-ink">
                {bankLinked ? bankName : "No bank linked"}
              </p>
              <p className="text-xs text-caddy-gray">
                {bankLinked ? "ShopCaddy can pay for purchases in Chat" : "Link a bank so Chat can check out for you"}
              </p>
            </div>
            {bankLinked && <ShieldCheck size={18} className="shrink-0 text-green-600" />}
          </div>
          <button
            onClick={() => (bankLinked ? unlinkBank() : setShowBankSheet(true))}
            className={`mt-3 w-full rounded-xl2 px-4 py-2.5 text-sm font-semibold ${
              bankLinked
                ? "border border-caddy-orange-light text-caddy-gray"
                : "bg-caddy-orange text-white shadow-floating"
            }`}
          >
            {bankLinked ? "Unlink bank" : "Link bank"}
          </button>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <p className="mb-2 text-sm font-semibold text-caddy-ink">Monthly shopping budget</p>
          <div className="flex items-center gap-2">
            <span className="text-caddy-gray">£</span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={() => {
                const n = Number(budgetInput);
                if (n > 0) setBudget(n);
              }}
              className="w-full rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
            />
          </div>
          <p className="mt-2 text-xs text-caddy-gray">
            ShopCaddy will flag it on Home when you're close to going over.
          </p>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-caddy-orange-dark" />
            <p className="text-sm font-semibold text-caddy-ink">Household</p>
          </div>
          <div className="space-y-2">
            {HOUSEHOLD.map((person) => (
              <div key={person.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-caddy-orange text-xs font-bold text-white">
                  {person.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-caddy-ink">{person.name}</p>
                </div>
                <span className="text-xs text-caddy-gray">{person.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Bell size={16} className="text-caddy-orange-dark" />
            <p className="text-sm font-semibold text-caddy-ink">Notifications</p>
          </div>
          <ToggleRow label="Price-drop alerts" checked={priceAlerts} onChange={setPriceAlerts} />
          <ToggleRow label="Budget warnings" checked={budgetAlerts} onChange={setBudgetAlerts} />
        </div>
      </div>

      <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl2 bg-caddy-orange-light/70 p-4 text-xs text-caddy-orange-dark">
        <Sparkles size={16} className="shrink-0" />
        ShopCaddy v0.1 prototype — pricing, AI responses and bank linking are simulated for this
        demo.
      </div>

      {showBankSheet && <BankLinkSheet onClose={() => setShowBankSheet(false)} />}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1.5">
      <span className="text-sm text-caddy-ink">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition-colors ${checked ? "bg-caddy-orange" : "bg-caddy-orange-light"}`}
      >
        <span
          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
