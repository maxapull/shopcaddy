"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, ShieldAlert, SendHorizonal } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ChatBubble } from "@/components/ChatBubble";
import { BankLinkSheet } from "@/components/BankLinkSheet";
import { chatRespond, chooseProduct, PendingPurchase } from "@/lib/ai";
import { useAppState } from "@/lib/store";
import { ChatMessage, Product } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I'm your ShopCaddy assistant. Ask me to buy something and, once your bank is linked, I'll find the best price and check out for you. Try “buy me a kettle under £30”.",
};

export default function ChatPage() {
  const { bankLinked, addOrder } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [pending, setPending] = useState<PendingPurchase | null>(null);
  const [input, setInput] = useState("");
  const [showBankSheet, setShowBankSheet] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const { message: reply, pendingProduct } = chatRespond(trimmed, pending, bankLinked);

    setMessages((prev) => [...prev, userMsg, reply]);
    setPending(pendingProduct);
    setInput("");

    if (reply.kind === "order-success" && reply.meta?.product) {
      const { product, orderTotal, originalPrice } = reply.meta;
      addOrder({
        id: `ord-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        productName: product.name,
        retailer: product.retailer,
        price: orderTotal ?? product.price,
        saved: originalPrice ? originalPrice - product.price : 0,
        status: "Placed",
      });
    }
  }

  function selectProduct(product: Product) {
    const { message: reply, pendingProduct } = chooseProduct(product, bankLinked);
    setMessages((prev) => [...prev, reply]);
    setPending(pendingProduct);
  }

  return (
    <div>
      <TopBar
        title="Chat with ShopCaddy"
        subtitle={bankLinked ? "Bank linked — I can check out for you" : "Bank not linked"}
        right={
          <button
            onClick={() => setShowBankSheet(true)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
              bankLinked ? "bg-green-100 text-green-700" : "bg-caddy-orange-light text-caddy-orange-dark"
            }`}
          >
            {bankLinked ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {bankLinked ? "Linked" : "Link bank"}
          </button>
        }
      />

      <div className="space-y-3 px-4 py-4">
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            onLinkBank={() => setShowBankSheet(true)}
            onConfirm={() => send("yes")}
            onSelectProduct={selectProduct}
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
          placeholder="Ask ShopCaddy to buy something…"
          className="flex-1 rounded-full border border-caddy-orange-light bg-caddy-cream px-4 py-2.5 text-sm outline-none focus:border-caddy-orange"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caddy-orange text-white shadow-floating disabled:opacity-40"
          aria-label="Send"
        >
          <SendHorizonal size={16} />
        </button>
      </form>

      {showBankSheet && <BankLinkSheet onClose={() => setShowBankSheet(false)} />}
    </div>
  );
}
