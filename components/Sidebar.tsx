"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NAV_ITEMS } from "@/lib/nav";
import { useAppState } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const { bankLinked } = useAppState();

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

      <div
        className={`flex items-center gap-2 rounded-xl2 px-3 py-2.5 text-xs font-semibold ${
          bankLinked ? "bg-green-100 text-green-700" : "bg-caddy-orange-light text-caddy-orange-dark"
        }`}
      >
        {bankLinked ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
        {bankLinked ? "Bank linked" : "Bank not linked"}
      </div>
    </aside>
  );
}
