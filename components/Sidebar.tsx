"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NAV_ITEMS } from "@/lib/nav";
import { useSession } from "@/lib/session-context";

export function Sidebar() {
  const pathname = usePathname();
  const { email } = useSession();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-caddy-orange-light/70 bg-white px-4 py-6 md:flex">
      <div className="px-2">
        <Logo />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-caddy-orange text-white"
                  : "text-caddy-ink hover:bg-caddy-orange-light hover:text-caddy-orange-dark"
              }`}
            >
              <Icon size={18} strokeWidth={2.25} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 truncate rounded-xl2 bg-caddy-orange-light px-3 py-2.5 text-xs font-semibold text-caddy-orange-dark">
        <UserRound size={14} className="shrink-0" />
        <span className="truncate">{email}</span>
      </div>
    </aside>
  );
}
