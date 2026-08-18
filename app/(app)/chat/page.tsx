"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ChatBubble } from "@/components/ChatBubble";
import { createClient } from "@/lib/supabase/client";
import { chooseProduct, chooseVariant, loggedMessage, respond } from "@/lib/assistant";
import { markPurchased } from "@/lib/actions";
import { categoryLabel } from "@/lib/catalog";
import { ChatMessage, Product, ProductVariant } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: 'Hi, I\'m your ShopCaddy assistant. Ask me to find something ("kettle under £30"), where it\'s cheapest, or how your budget\'s looking this month.',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    const supabase = createClient();
    const reply = await respond(supabase, trimmed);
    setMessages((prev) => [...prev, reply]);
    setBusy(false);
  }

  function selectProduct(product: Product) {
    setMessages((prev) => [...prev, chooseProduct(product)]);
  }

  function selectVariant(product: Product, variant: ProductVariant) {
    setMessages((prev) => [...prev, chooseVariant(product, variant)]);
  }

  async function handleMarkPurchased(product: Product, variant?: ProductVariant) {
    setBusy(true);
    const result = await markPurchased({
      amount: product.price,
      category: categoryLabel(product.category),
      productName: variant ? `${product.name} (${variant.kind} ${variant.value})` : product.name,
      retailer: product.retailer,
    });
    if (result.success) {
      setMessages((prev) => [...prev, loggedMessage(product)]);
    }
    setBusy(false);
  }

  return (
    <div>
      <TopBar title="Chat with ShopCaddy" subtitle="Find it, compare it, track what you spend" />

      <div className="space-y-3 px-4 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            onSelectProduct={selectProduct}
            onSelectVariant={selectVariant}
            onMarkPurchased={handleMarkPurchased}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-caddy-orange-light/70 bg-white px-4 py-3 md:rounded-b-xl2 md:border md:border-t-0 md:border-caddy-orange-light md:shadow-card"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ShopCaddy to find something…"
          className="flex-1 rounded-full border border-caddy-orange-light bg-caddy-cream px-4 py-2.5 text-sm outline-none focus:border-caddy-orange"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caddy-orange text-white shadow-floating disabled:opacity-40"
          aria-label="Send"
        >
          <SendHorizonal size={16} />
        </button>
      </form>
    </div>
  );
}
