import { CheckCircle2, ShieldAlert } from "lucide-react";
import { ChatMessage } from "@/types";
import { Logo } from "@/components/Logo";

export function ChatBubble({
  message,
  onLinkBank,
  onConfirm,
}: {
  message: ChatMessage;
  onLinkBank?: () => void;
  onConfirm?: () => void;
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
        <div className="rounded-2xl rounded-tl-sm bg-caddy-orange-light/70 px-4 py-2.5 text-sm text-caddy-ink shadow-card">
          {message.text}
        </div>

        {message.kind === "order-confirm" && message.meta?.product && (
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl2 border border-caddy-orange bg-white px-4 py-2 text-sm font-semibold text-caddy-orange-dark shadow-card hover:bg-caddy-orange-light"
          >
            <CheckCircle2 size={16} /> Confirm purchase — £{message.meta.product.price.toFixed(2)}
          </button>
        )}

        {message.kind === "bank-required" && (
          <button
            onClick={onLinkBank}
            className="flex items-center gap-2 rounded-xl2 border border-caddy-orange bg-white px-4 py-2 text-sm font-semibold text-caddy-orange-dark shadow-card hover:bg-caddy-orange-light"
          >
            <ShieldAlert size={16} /> Link bank now
          </button>
        )}

        {message.kind === "order-success" && message.meta?.product && (
          <div className="rounded-xl2 border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-800">
            <p className="font-semibold">Order placed</p>
            <p>
              {message.meta.product.name} · £{message.meta.orderTotal?.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
