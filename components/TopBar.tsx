import { ReactNode } from "react";

export function TopBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-caddy-orange-light/70 bg-white/95 px-5 py-4 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold text-caddy-ink">{title}</h1>
        {subtitle && <p className="text-sm text-caddy-gray">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
