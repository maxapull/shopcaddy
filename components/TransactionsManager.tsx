"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";
import { addTransaction, deleteTransaction, updateTransaction } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/catalog";
import { CategoryBudget, Transaction } from "@/types";

const SOURCE_STYLES: Record<Transaction["source"], string> = {
  manual: "bg-blue-100 text-blue-700",
  shopping: "bg-caddy-orange-light text-caddy-orange-dark",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

interface FormState {
  id?: string;
  amount: string;
  category: string;
  note: string;
  date: string;
}

const EMPTY_FORM: FormState = { amount: "", category: BUDGET_CATEGORIES[0], note: "", date: todayISO() };

export function TransactionsManager({
  transactions,
  budgets,
  monthlyBudget,
}: {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  monthlyBudget: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date >= monthStartISO()),
    [transactions]
  );

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTransactions) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return map;
  }, [monthTransactions]);

  const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const unbudgetedCategories = [...spendByCategory.keys()].filter(
    (c) => !budgets.some((b) => b.category === c)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);

    const payload = { amount: form.amount, category: form.category, note: form.note, date: form.date };
    const result = form.id
      ? await updateTransaction({ ...payload, id: form.id })
      : await addTransaction(payload);

    setBusy(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setForm(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setBusy(true);
    await deleteTransaction(id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-5 px-5 pt-4">
      <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-caddy-ink">This month, overall</span>
          <span className="text-caddy-gray">
            £{totalSpent.toFixed(2)} / £{monthlyBudget.toFixed(2)}
          </span>
        </div>
        <BudgetBar spent={totalSpent} limit={monthlyBudget} />

        {budgets.length > 0 && (
          <div className="mt-4 space-y-3">
            {budgets.map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-caddy-ink">{b.category}</span>
                  <span className="text-caddy-gray">
                    £{(spendByCategory.get(b.category) ?? 0).toFixed(2)} / £{b.monthlyLimit.toFixed(2)}
                  </span>
                </div>
                <BudgetBar spent={spendByCategory.get(b.category) ?? 0} limit={b.monthlyLimit} thin />
              </div>
            ))}
          </div>
        )}

        {unbudgetedCategories.length > 0 && (
          <p className="mt-3 text-[11px] text-caddy-gray">
            No budget set yet for {unbudgetedCategories.join(", ")} — set one on the Account page.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-caddy-ink">Transactions</h2>
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="flex items-center gap-1.5 rounded-full bg-caddy-orange px-3.5 py-2 text-xs font-semibold text-white shadow-floating"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {transactions.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center text-caddy-gray">
          <Package size={28} className="mb-2 text-caddy-orange-light" />
          <p className="text-sm">Nothing logged yet — add a spend, or log a purchase from Chat.</p>
        </div>
      )}

      <div className="space-y-2 pb-4">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-start justify-between gap-3 rounded-xl2 border border-caddy-orange-light bg-white p-3.5 shadow-card"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_STYLES[t.source]}`}
                >
                  {t.category}
                </span>
                <span className="text-[11px] text-caddy-gray">
                  {new Date(t.date).toLocaleDateString("en-GB")}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-caddy-ink">
                {t.productName ?? t.note ?? "—"}
              </p>
              {t.retailer && <p className="text-xs text-caddy-gray">{t.retailer}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p className="font-bold text-caddy-ink">£{t.amount.toFixed(2)}</p>
              {t.source === "manual" && (
                <button
                  onClick={() =>
                    setForm({
                      id: t.id,
                      amount: String(t.amount),
                      category: t.category,
                      note: t.note ?? "",
                      date: t.date,
                    })
                  }
                  aria-label="Edit transaction"
                  className="text-caddy-gray hover:text-caddy-orange-dark"
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                onClick={() => handleDelete(t.id)}
                disabled={busy}
                aria-label="Delete transaction"
                className="text-caddy-gray hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-floating md:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-caddy-ink">
                {form.id ? "Edit transaction" : "Add transaction"}
              </h2>
              <button onClick={() => setForm(null)} className="text-caddy-gray hover:text-caddy-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5">
                <span className="text-caddy-gray">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5 text-sm outline-none focus:border-caddy-orange"
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Note (optional)"
                className="w-full rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5 text-sm outline-none focus:border-caddy-orange"
              />

              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5 text-sm outline-none focus:border-caddy-orange"
              />

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl2 bg-caddy-orange px-4 py-2.5 text-sm font-semibold text-white shadow-floating disabled:opacity-60"
              >
                {form.id ? "Save changes" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetBar({ spent, limit, thin }: { spent: number; limit: number; thin?: boolean }) {
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = limit > 0 && spent > limit;
  return (
    <div className={`w-full overflow-hidden rounded-full bg-caddy-orange-light ${thin ? "h-1.5" : "h-2.5"}`}>
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-caddy-orange"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
