"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, FolderOpen, MessageCircle, Sparkles, Wand2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ListItemRow } from "@/components/ListItemRow";
import { TotalBar } from "@/components/TotalBar";
import { parseRequestToItems, listTotal, listSavings } from "@/lib/ai";
import { useAppState } from "@/lib/store";
import { ListItem } from "@/types";

const SUGGESTIONS = [
  "Chicken curry for 4",
  "Pasta night for 2",
  "New running shoes and a t-shirt",
  "Weekly breakfast basics",
];

export default function ListMakerPage() {
  const { savedLists, saveList } = useAppState();
  const [prompt, setPrompt] = useState("");
  const [items, setItems] = useState<ListItem[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  function generate(text: string) {
    const query = text.trim();
    if (!query) return;
    const newItems = parseRequestToItems(query);
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.product.id));
      const merged = [...prev, ...newItems.filter((i) => !existingIds.has(i.product.id))];
      return merged;
    });
    setPrompt("");
  }

  function updateItem(id: string, patch: Partial<ListItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSave() {
    if (items.length === 0) return;
    saveList({
      id: `list-${Date.now()}`,
      title: items[0]?.product.name ? `List with ${items[0].product.name}` : "My list",
      createdAt: new Date().toISOString().slice(0, 10),
      items,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  }

  const total = listTotal(items);
  const savings = listSavings(items);

  return (
    <div className={items.length > 0 ? "pb-36" : "pb-8"}>
      <TopBar title="AI List Maker" subtitle="Tell me what you need — food or clothes" />

      <div className="px-5 pt-4">
        <div className="rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
          <div className="flex items-start gap-2">
            <Wand2 size={18} className="mt-2 shrink-0 text-caddy-orange" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. “Chicken curry for 4, plus a pair of running shoes”"
              rows={2}
              className="w-full resize-none border-none bg-transparent py-1.5 text-sm text-caddy-ink outline-none placeholder:text-caddy-gray"
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => generate(prompt)}
              disabled={!prompt.trim()}
              className="flex items-center gap-1.5 rounded-full bg-caddy-orange px-4 py-2 text-xs font-semibold text-white shadow-floating disabled:opacity-40"
            >
              <Sparkles size={14} /> Generate list
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
        <div className="mt-5 space-y-3 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-caddy-ink">Your list ({items.length})</h2>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs font-semibold text-caddy-orange-dark"
            >
              <BookmarkPlus size={14} /> {savedNotice ? "Saved!" : "Save list"}
            </button>
          </div>
          {items.map((item) => (
            <ListItemRow
              key={item.id}
              item={item}
              onToggleAlt={() => updateItem(item.id, { useAlternative: !item.useAlternative })}
              onQtyChange={(qty) => updateItem(item.id, { quantity: qty })}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}

      {items.length === 0 && savedLists.length === 0 && (
        <div className="mt-10 flex flex-col items-center px-8 text-center text-caddy-gray">
          <FolderOpen size={28} className="mb-2 text-caddy-orange-light" />
          <p className="text-sm">
            Describe what you need above and ShopCaddy will build a priced list, with cheaper
            swaps found automatically.
          </p>
        </div>
      )}

      {savedLists.length > 0 && (
        <div className="mt-8 px-5 pb-4">
          <h2 className="mb-3 text-sm font-bold text-caddy-ink">Saved lists</h2>
          <div className="space-y-2">
            {savedLists.map((list) => (
              <button
                key={list.id}
                onClick={() => setItems(list.items)}
                className="flex w-full items-center justify-between rounded-xl2 border border-caddy-orange-light bg-white p-3 text-left shadow-card"
              >
                <div>
                  <p className="text-sm font-semibold text-caddy-ink">{list.title}</p>
                  <p className="text-xs text-caddy-gray">
                    {list.items.length} items · {list.createdAt}
                  </p>
                </div>
                <p className="text-sm font-bold text-caddy-ink">£{listTotal(list.items).toFixed(2)}</p>
              </button>
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
            <MessageCircle size={14} /> Buy in chat
          </Link>
        </TotalBar>
      )}
    </div>
  );
}
