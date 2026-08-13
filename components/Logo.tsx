import { ShoppingBasket } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "lg" ? 22 : size === "sm" ? 15 : 18;
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${box} shrink-0 rounded-xl2 bg-caddy-orange flex items-center justify-center shadow-floating`}
      >
        <ShoppingBasket size={icon} className="text-white" strokeWidth={2.25} />
      </div>
      <span className={`${text} font-bold tracking-tight text-caddy-ink`}>
        Shop<span className="text-caddy-orange">Caddy</span>
      </span>
    </div>
  );
}
