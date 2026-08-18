"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ChatBubble } from "@/components/ChatBubble";
import { createClient } from "@/lib/supabase/client";
import { loggedMessage, respond } from "@/lib/assistant";
import { addTransaction } from "@/lib/actions";
import { ChatMessage, PendingLog } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: 'Hi, I\'m your ShopCaddy budget assistant. Tell me what you\'ve spent ("spent £12 on lunch"), ask how your budget\'s looking, or ask for money-saving tips.',
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

  async function handleConfirmLog(log: PendingLog) {
    setBusy(true);
    const result = await addTransaction({
      amount: log.amount,
      category: log.category,
      note: log.note,
      date: new Date().toISOString().slice(0, 10),
    });
    if (result.success) {
      setMessages((prev) => [...prev, loggedMessage(log)]);
    }
    setBusy(false);
  }

  return (
    <div>
      <TopBar title="Chat with ShopCaddy" subtitle="Log spends, check your budget, get savings tips" />

      <div className="space-y-3 px-4 py-4">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} onConfirmLog={handleConfirmLog} />
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
          placeholder='Try "spent £12 on lunch"…'
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
