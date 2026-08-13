"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-caddy-orange-light/70 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl2 py-1.5 transition-colors"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-caddy-orange text-white" : "text-caddy-gray"
                }`}
              >
                <Icon size={18} strokeWidth={2.25} />
              </div>
              <span
                className={`text-[11px] font-medium ${
                  active ? "text-caddy-orange-dark" : "text-caddy-gray"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
