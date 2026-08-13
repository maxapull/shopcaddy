import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "orange";
}) {
  return (
    <div className="flex-1 rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
      <div
        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
          tone === "orange" ? "bg-caddy-orange text-white" : "bg-caddy-orange-light text-caddy-orange-dark"
        }`}
      >
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <p className="text-lg font-bold text-caddy-ink">{value}</p>
      <p className="text-xs text-caddy-gray">{label}</p>
    </div>
  );
}
