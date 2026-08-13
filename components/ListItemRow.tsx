"use client";

import { Leaf, Minus, Plus, X } from "lucide-react";
import { ListItem } from "@/types";

export function ListItemRow({
  item,
  onToggleAlt,
  onQtyChange,
  onRemove,
}: {
  item: ListItem;
  onToggleAlt: () => void;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  const chosen = item.useAlternative && item.alternative ? item.alternative : item.product;
  const saving = item.alternative ? item.product.price - item.alternative.price : 0;

  return (
    <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-caddy-ink">{chosen.name}</p>
          <p className="text-xs text-caddy-gray">{chosen.retailer}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap font-bold text-caddy-ink">
            £{(chosen.price * item.quantity).toFixed(2)}
          </p>
          <button
            onClick={onRemove}
            aria-label="Remove item"
            className="text-caddy-gray hover:text-caddy-orange-dark"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-caddy-orange-light px-1.5 py-1">
          <button
            onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
            className="flex h-6 w-6 items-center justify-center rounded-full text-caddy-orange-dark hover:bg-caddy-orange-light"
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onQtyChange(item.quantity + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-caddy-orange-dark hover:bg-caddy-orange-light"
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        {chosen.ecoScore && chosen.ecoScore >= 4 && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-green-700">
            <Leaf size={12} /> Eco pick
          </span>
        )}
      </div>

      {item.alternative && (
        <button
          onClick={onToggleAlt}
          className={`mt-3 w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
            item.useAlternative
              ? "border-caddy-orange bg-caddy-orange-light text-caddy-orange-dark"
              : "border-dashed border-caddy-orange-light text-caddy-gray hover:border-caddy-orange"
          }`}
        >
          {item.useAlternative ? (
            <>
              Switched to <b>{item.alternative.retailer}</b> — saving £{saving.toFixed(2)}. Tap to
              switch back.
            </>
          ) : (
            <>
              Cheaper option: <b>{item.alternative.retailer}</b> for £{item.alternative.price.toFixed(2)}{" "}
              (save £{saving.toFixed(2)})
            </>
          )}
        </button>
      )}
    </div>
  );
}
