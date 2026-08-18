"use client";

import { useEffect, useState } from "react";
import { BookmarkPlus, FolderOpen, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ListItemRow } from "@/components/ListItemRow";
import { TotalBar } from "@/components/TotalBar";
import { createClient } from "@/lib/supabase/client";
import { saveShoppingList } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/categories";
import { ListItem } from "@/types";

interface SavedListSummary {
  id: string;
  title: string;
  created_at: string;
  itemCount: number;
  total: number;
}

export default function ListMakerPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [savedLists, setSavedLists] = useState<SavedListSummary[]>([]);

  useEffect(() => {
    loadSavedLists();
  }, []);

  async function loadSavedLists() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shopping_lists")
      .select("id, title, created_at, shopping_list_items(price, quantity)")
      .order("created_at", { ascending: false });

    setSavedLists(
      (data ?? []).map((list) => {
        const rows = (list.shopping_list_items ?? []) as { price: number; quantity: number }[];
        return {
          id: list.id,
          title: list.title,
          created_at: list.created_at,
          itemCount: rows.length,
          total: rows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0),
        };
      })
    );
  }

  function addItem() {
    const trimmedName = name.trim();
    const priceNum = Number(price);
    if (!trimmedName || !Number.isFinite(priceNum) || priceNum < 0) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmedName, category, price: priceNum, quantity: 1 },
    ]);
    setName("");
    setPrice("");
  }

  function updateQty(id: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave() {
    if (items.length === 0 || saving) return;
    setSaving(true);
    const result = await saveShoppingList({
      title: `List with ${items[0].name}`,
      items: items.map((i) => ({
        name: i.name,
        category: i.category,
        price: i.price,
        quantity: i.quantity,
      })),
    });
    setSaving(false);
    if (result.success) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 1800);
      loadSavedLists();
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="pb-8">
      <TopBar title="List Maker" subtitle="Add what you need and the price you expect to pay" />

      <div className="px-5 pt-4">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item, e.g. Milk"
              className="w-full rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
            />
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="flex w-28 items-center gap-1 rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2">
                <span className="text-caddy-gray">£</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={addItem}
              disabled={!name.trim() || !price.trim()}
              className="flex items-center gap-1.5 rounded-full bg-caddy-orange px-4 py-2 text-xs font-semibold text-white shadow-floating disabled:opacity-40"
            >
              <Plus size={14} /> Add to list
            </button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-5 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-caddy-ink">Your list ({items.length})</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-semibold text-caddy-orange-dark disabled:opacity-60"
            >
              <BookmarkPlus size={14} /> {savedNotice ? "Saved!" : "Save list"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item) => (
              <ListItemRow
                key={item.id}
                item={item}
                onQtyChange={(qty) => updateQty(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && savedLists.length === 0 && (
        <div className="mt-10 flex flex-col items-center px-8 text-center text-caddy-gray">
          <FolderOpen size={28} className="mb-2 text-caddy-orange-light" />
          <p className="text-sm">
            Add items above and ShopCaddy totals and organises them for you — no catalog, just
            what you tell it.
          </p>
        </div>
      )}

      {savedLists.length > 0 && (
        <div className="mt-8 px-5 pb-4">
          <h2 className="mb-3 text-sm font-bold text-caddy-ink">Saved lists</h2>
          <div className="space-y-2">
            {savedLists.map((list) => (
              <div
                key={list.id}
                className="flex w-full items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white p-3 text-left shadow-card"
              >
                <div>
                  <p className="text-sm font-semibold text-caddy-ink">{list.title}</p>
                  <p className="text-xs text-caddy-gray">
                    {list.itemCount} items · {new Date(list.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <p className="text-sm font-bold text-caddy-ink">£{list.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && <TotalBar total={total} savings={0} />}
    </div>
  );
}
