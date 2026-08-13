"use client";

import { Package, PiggyBank } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useAppState } from "@/lib/store";

const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-caddy-orange-light text-caddy-orange-dark",
  Placed: "bg-blue-100 text-blue-700",
};

export default function OrdersPage() {
  const { orders, monthSaved } = useAppState();

  return (
    <div className="pb-6">
      <TopBar title="Orders" subtitle="Everything ShopCaddy has bought for you" />

      <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
          <PiggyBank size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-caddy-ink">Total saved so far</p>
          <p className="text-xs text-caddy-gray">£{monthSaved.toFixed(2)} vs. full retail price</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 px-5">
        {orders.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center text-caddy-gray">
            <Package size={28} className="mb-2 text-caddy-orange-light" />
            <p className="text-sm">No orders yet — ask ShopCaddy to buy something in Chat.</p>
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-caddy-ink">{order.productName}</p>
                <p className="text-xs text-caddy-gray">
                  {order.retailer} · {order.date}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-bold text-caddy-ink">£{order.price.toFixed(2)}</span>
              {order.saved > 0 && (
                <span className="text-xs font-medium text-caddy-orange-dark">
                  Saved £{order.saved.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
