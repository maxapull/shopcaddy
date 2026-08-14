import { ExternalLink, Truck } from "lucide-react";
import { Product } from "@/types";
import { deliveryOptions, productUrl } from "@/lib/catalog";

export function ProductCard({
  product,
  onSelect,
  selectLabel = "Choose this",
  badge,
}: {
  product: Product;
  onSelect?: (product: Product) => void;
  selectLabel?: string;
  badge?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl2 border border-caddy-orange-light bg-white p-3 shadow-card">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-caddy-ink">{product.name}</p>
          {badge && (
            <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-caddy-ink/60">
          {product.retailer} · £{product.price.toFixed(2)}
        </p>
        <div className="flex flex-wrap gap-1">
          {deliveryOptions(product).map((d) => (
            <span
              key={d}
              className="flex items-center gap-1 rounded-full bg-caddy-orange-light/60 px-2 py-0.5 text-[10px] font-medium text-caddy-orange-dark"
            >
              <Truck size={10} /> {d}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-0.5">
          <a
            href={productUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-caddy-orange-dark hover:underline"
          >
            <ExternalLink size={12} /> View product
          </a>
          {onSelect && (
            <button
              onClick={() => onSelect(product)}
              className="rounded-full bg-caddy-orange px-3 py-1 text-xs font-semibold text-white hover:bg-caddy-orange-dark"
            >
              {selectLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
