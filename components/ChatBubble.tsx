"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ChatMessage, PendingLog } from "@/types";
import { Logo } from "@/components/Logo";
import { BUDGET_CATEGORIES } from "@/lib/categories";

function ConfirmLogCard({
  log,
  onConfirm,
}: {
  log: PendingLog;
  onConfirm?: (log: PendingLog) => void;
}) {
  const [category, setCategory] = useState(log.category);

  return (
    <div className="space-y-2 rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-caddy-ink">£{log.amount.toFixed(2)}</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-caddy-orange-light bg-caddy-cream px-2 py-1 text-xs outline-none"
        >
          {BUDGET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => onConfirm?.({ ...log, category })}
        className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-caddy-orange px-4 py-2 text-sm font-semibold text-white shadow-floating"
      >
        <CheckCircle2 size={16} /> Log it
      </button>
    </div>
  );
}

export function ChatBubble({
  message,
  onConfirmLog,
}: {
  message: ChatMessage;
  onConfirmLog?: (log: PendingLog) => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-caddy-orange px-4 py-2.5 text-sm text-white shadow-card md:max-w-sm">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">
        <Logo size="sm" />
      </div>
      <div className="max-w-[82%] space-y-2 md:max-w-sm">
        <div className="whitespace-pre-line rounded-2xl rounded-tl-sm bg-caddy-orange-light/70 px-4 py-2.5 text-sm text-caddy-ink shadow-card">
          {message.text}
        </div>

        {message.kind === "confirm-log" && message.meta?.pendingLog && (
          <ConfirmLogCard log={message.meta.pendingLog} onConfirm={onConfirmLog} />
        )}

        {message.kind === "logged" && (
          <div className="rounded-xl2 border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-800">
            <p className="font-semibold">Logged to your budget</p>
          </div>
        )}
      </div>
    </div>
  );
}
