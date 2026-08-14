import { CheckCircle2, ShieldAlert, Truck } from "lucide-react";
import { ChatMessage, DeliveryOption, Product } from "@/types";
import { Logo } from "@/components/Logo";
import { ProductCard } from "@/components/ProductCard";

function DeliveryLine({ option }: { option: DeliveryOption }) {
  return (
    <p className="flex items-center gap-1 px-1 text-xs text-caddy-ink/60">
      <Truck size={12} /> {option.label} ({option.eta}) —{" "}
      {option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}
    </p>
  );
}

export function ChatBubble({
  message,
  onLinkBank,
  onConfirm,
  onSelectProduct,
  onSelectDelivery,
}: {
  message: ChatMessage;
  onLinkBank?: () => void;
  onConfirm?: () => void;
  onSelectProduct?: (product: Product) => void;
  onSelectDelivery?: (option: DeliveryOption) => void;
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

        {message.kind === "product-options" && message.meta?.options && (
          <div className="space-y-2">
            {message.meta.options.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                badge={i === 0 ? "Cheapest" : undefined}
              />
            ))}
          </div>
        )}

        {message.kind === "delivery-options" && message.meta?.deliveryOptions && (
          <div className="space-y-2">
            {message.meta.deliveryOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelectDelivery?.(option)}
                className="flex w-full items-center justify-between gap-3 rounded-xl2 border border-caddy-orange-light bg-white px-4 py-2.5 text-left shadow-card hover:bg-caddy-orange-light/40"
              >
                <span>
                  <span className="block text-sm font-semibold text-caddy-ink">{option.label}</span>
                  <span className="block text-xs text-caddy-ink/60">{option.eta}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-caddy-orange-dark">
                  {option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {message.kind === "order-confirm" && message.meta?.product && (
          <div className="space-y-2">
            <ProductCard product={message.meta.product} />
            {message.meta.deliveryOption && <DeliveryLine option={message.meta.deliveryOption} />}
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 rounded-xl2 border border-caddy-orange bg-white px-4 py-2 text-sm font-semibold text-caddy-orange-dark shadow-card hover:bg-caddy-orange-light"
            >
              <CheckCircle2 size={16} /> Confirm purchase — £
              {(message.meta.product.price + (message.meta.deliveryOption?.price ?? 0)).toFixed(2)}
            </button>
          </div>
        )}

        {message.kind === "bank-required" && (
          <div className="space-y-2">
            {message.meta?.product && <ProductCard product={message.meta.product} />}
            {message.meta?.deliveryOption && <DeliveryLine option={message.meta.deliveryOption} />}
            <button
              onClick={onLinkBank}
              className="flex items-center gap-2 rounded-xl2 border border-caddy-orange bg-white px-4 py-2 text-sm font-semibold text-caddy-orange-dark shadow-card hover:bg-caddy-orange-light"
            >
              <ShieldAlert size={16} /> Link bank now
            </button>
          </div>
        )}

        {message.kind === "order-success" && message.meta?.product && (
          <div className="space-y-2">
            <ProductCard product={message.meta.product} />
            {message.meta.deliveryOption && <DeliveryLine option={message.meta.deliveryOption} />}
            <div className="rounded-xl2 border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-800">
              <p className="font-semibold">Order placed</p>
              <p>
                {message.meta.product.name} · £{message.meta.orderTotal?.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
