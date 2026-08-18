"use client";

import { Minus, Plus, X } from "lucide-react";
import { ListItem } from "@/types";

export function ListItemRow({
  item,
  onQtyChange,
  onRemove,
}: {
  item: ListItem;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-caddy-ink">{item.name}</p>
          <p className="text-xs text-caddy-gray">{item.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap font-bold text-caddy-ink">
            £{(item.price * item.quantity).toFixed(2)}
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

      <div className="mt-3 flex items-center gap-2 rounded-full border border-caddy-orange-light px-1.5 py-1 w-fit">
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
    </div>
  );
}
