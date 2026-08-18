import { CheckCircle2 } from "lucide-react";
import { ChatMessage, Product, ProductVariant } from "@/types";
import { Logo } from "@/components/Logo";
import { ProductCard } from "@/components/ProductCard";

export function ChatBubble({
  message,
  onSelectProduct,
  onSelectVariant,
  onMarkPurchased,
}: {
  message: ChatMessage;
  onSelectProduct?: (product: Product) => void;
  onSelectVariant?: (product: Product, variant: ProductVariant) => void;
  onMarkPurchased?: (product: Product, variant?: ProductVariant) => void;
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

        {message.kind === "variant-options" && message.meta?.product && (
          <div className="flex flex-wrap gap-2">
            {message.meta.product.variants.map((v) => (
              <button
                key={v.id}
                disabled={!v.inStock}
                onClick={() => onSelectVariant?.(message.meta!.product!, v)}
                className="rounded-full border border-caddy-orange-light bg-white px-3.5 py-1.5 text-xs font-semibold text-caddy-ink shadow-card hover:border-caddy-orange hover:text-caddy-orange-dark disabled:opacity-40"
              >
                {v.value}
                {!v.inStock && " · out of stock"}
              </button>
            ))}
          </div>
        )}

        {message.kind === "product-ready" && message.meta?.product && (
          <div className="space-y-2">
            <ProductCard
              product={message.meta.product}
              linkLabel={`Buy at ${message.meta.product.retailer} ↗`}
            />
            <button
              onClick={() => onMarkPurchased?.(message.meta!.product!, message.meta!.variant)}
              className="flex items-center gap-2 rounded-xl2 border border-caddy-orange bg-white px-4 py-2 text-sm font-semibold text-caddy-orange-dark shadow-card hover:bg-caddy-orange-light"
            >
              <CheckCircle2 size={16} /> I bought this
            </button>
          </div>
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
