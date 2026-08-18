"use client";

import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, Camera, FolderOpen, Loader2, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ListItemRow } from "@/components/ListItemRow";
import { TotalBar } from "@/components/TotalBar";
import { createClient } from "@/lib/supabase/client";
import { saveShoppingList } from "@/lib/actions";
import { BUDGET_CATEGORIES } from "@/lib/categories";
import { parseReceiptText, scanImageText } from "@/lib/ocr";
import { ListItem } from "@/types";

interface SavedListSummary {
  id: string;
  title: string;
  created_at: string;
  itemCount: number;
  total: number;
}

interface HistoryItem {
  name: string;
  category: string;
  price: number;
}

export default function ListMakerPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [savedLists, setSavedLists] = useState<SavedListSummary[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSavedLists();
    loadHistory();
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

  // Every item the user has ever added to a saved list, deduped to the most
  // recent price/category per name — their own personal history, not a
  // shared catalog.
  async function loadHistory() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shopping_list_items")
      .select("name, category, price, created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    const seen = new Set<string>();
    const deduped: HistoryItem[] = [];
    for (const row of data ?? []) {
      const key = row.name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduped.push({ name: row.name, category: row.category, price: Number(row.price) });
    }
    setHistory(deduped);
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

  function pickSuggestion(s: HistoryItem) {
    setName(s.name);
    setCategory(s.category);
    setPrice(String(s.price));
    setShowSuggestions(false);
  }

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setScanning(true);
    setScanError(null);
    try {
      const text = await scanImageText(file);
      const guess = parseReceiptText(text);
      if (guess.name) setName(guess.name);
      if (guess.price !== null) setPrice(String(guess.price));
      if (!guess.name && guess.price === null) {
        setScanError("Couldn't read anything from that photo — try a clearer shot, or enter it manually.");
      }
    } catch {
      setScanError("Scan failed — enter the item manually.");
    } finally {
      setScanning(false);
    }
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
      loadHistory();
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const suggestions = name.trim()
    ? history.filter((h) => h.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="pb-8">
      <TopBar title="List Maker" subtitle="Add what you need and the price you expect to pay" />

      <div className="px-5 pt-4">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
          <div className="space-y-2">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Item, e.g. Milk"
                  className="w-full rounded-lg border border-caddy-orange-light bg-caddy-cream px-3 py-2 text-sm outline-none focus:border-caddy-orange"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-caddy-orange-light bg-white shadow-card">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-caddy-orange-light/40"
                      >
                        <span className="truncate text-caddy-ink">{s.name}</span>
                        <span className="ml-2 shrink-0 text-xs text-caddy-gray">
                          £{s.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleScan}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                aria-label="Scan a price tag or receipt"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-caddy-orange-light text-caddy-orange-dark hover:bg-caddy-orange-light disabled:opacity-50"
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>

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

          {scanError && <p className="mt-2 text-xs font-medium text-red-600">{scanError}</p>}
          <p className="mt-2 text-[11px] text-caddy-gray">
            The camera reads printed text off a price tag or receipt — it can't recognise an item
            with no visible text, so double-check what it fills in.
          </p>

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
