import { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl2 border border-caddy-orange-light bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
          <Icon size={17} strokeWidth={2.25} />
        </div>
        {badge && (
          <span className="rounded-full bg-caddy-ink px-2 py-0.5 text-[10px] font-semibold text-white">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-caddy-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-caddy-gray">{description}</p>
    </div>
  );
}
