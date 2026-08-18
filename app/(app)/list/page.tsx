"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkPlus, FolderOpen, Loader2, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ListItemRow } from "@/components/ListItemRow";
import { TotalBar } from "@/components/TotalBar";
import { createClient } from "@/lib/supabase/client";
import { buildListFromText, listSavings, listTotal } from "@/lib/assistant";
import { saveShoppingList } from "@/lib/actions";
import { ListItem } from "@/types";

const SUGGESTIONS = ["Milk, bread and eggs", "New running shoes and a t-shirt", "Kettle and cotton socks"];

interface SavedListSummary {
  id: string;
  title: string;
  created_at: string;
  itemCount: number;
  total: number;
}

export default function ListMakerPage() {
  const [prompt, setPrompt] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
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
      .select("id, title, created_at, shopping_list_items(quantity, products(price))")
      .order("created_at", { ascending: false });

    setSavedLists(
      (data ?? []).map((list) => {
        // Supabase's untyped client can't statically know this is a
        // many-to-one relation, so it types the embedded resource as an
        // array either way — handle both shapes defensively at runtime.
        const rows = (list.shopping_list_items ?? []) as unknown as {
          quantity: number;
          products: { price: number } | { price: number }[] | null;
        }[];
        const priceOf = (r: (typeof rows)[number]) =>
          Array.isArray(r.products) ? (r.products[0]?.price ?? 0) : (r.products?.price ?? 0);
        return {
          id: list.id,
          title: list.title,
          created_at: list.created_at,
          itemCount: rows.length,
          total: rows.reduce((sum, r) => sum + priceOf(r) * r.quantity, 0),
        };
      })
    );
  }

  async function generate(text: string) {
    const query = text.trim();
    if (!query || loading) return;
    setLoading(true);
    const supabase = createClient();
    const newItems = await buildListFromText(supabase, query);
    setItems((prev) => {
      const existingNames = new Set(prev.map((i) => i.options[i.selectedIndex].name));
      const merged = [...prev, ...newItems.filter((i) => !existingNames.has(i.options[0].name))];
      return merged;
    });
    setPrompt("");
    setLoading(false);
  }

  function updateItem(id: string, patch: Partial<ListItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave() {
    if (items.length === 0 || saving) return;
    setSaving(true);
    const result = await saveShoppingList({
      title: `List with ${items[0].options[items[0].selectedIndex].name}`,
      items: items.map((i) => ({ productId: i.options[i.selectedIndex].id, quantity: i.quantity })),
    });
    setSaving(false);
    if (result.success) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 1800);
      loadSavedLists();
    }
  }

  const total = listTotal(items);
  const savings = listSavings(items);

  return (
    <div className="pb-8">
      <TopBar title="AI List Maker" subtitle="Tell me what you need — food, household or clothes" />

      <div className="px-5 pt-4">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
          <div className="flex items-start gap-2">
            <Wand2 size={18} className="mt-2 shrink-0 text-caddy-orange" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. “milk, bread and a kettle”"
              rows={2}
              className="w-full resize-none border-none bg-transparent py-1.5 text-sm text-caddy-ink outline-none placeholder:text-caddy-gray"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => generate(prompt)}
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-1.5 rounded-full bg-caddy-orange px-4 py-2 text-xs font-semibold text-white shadow-floating disabled:opacity-40"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate list
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => generate(s)}
              className="rounded-full border border-caddy-orange-light px-3 py-1.5 text-xs text-caddy-gray hover:border-caddy-orange hover:text-caddy-orange-dark"
            >
              {s}
            </button>
          ))}
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
                onSelectOption={(index) => updateItem(item.id, { selectedIndex: index })}
                onQtyChange={(qty) => updateItem(item.id, { quantity: qty })}
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
            Describe what you need above and ShopCaddy will build a priced list, comparing
            retailers automatically.
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

      {items.length > 0 && (
        <TotalBar total={total} savings={savings}>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-xl2 bg-caddy-orange px-3.5 py-2.5 text-xs font-semibold text-white"
          >
            <MessageCircle size={14} /> Ask ShopCaddy
          </Link>
        </TotalBar>
      )}
    </div>
  );
}
