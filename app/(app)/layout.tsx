import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionProvider } from "@/lib/session-context";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";

// Every page in this group is inherently per-user (session + live budget
// data) — never statically prerenderable, and must not be attempted at
// build time (which would fail before Supabase env vars even exist yet).
export const dynamic = "force-dynamic";

// Middleware already redirects unauthenticated requests to /login — this
// check is a defense-in-depth backstop, not the primary gate.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SessionProvider value={{ userId: user.id, email: user.email ?? null }}>
      <div className="min-h-screen bg-caddy-cream md:flex">
        <Sidebar />
        <div className="relative mx-auto min-h-screen w-full max-w-md bg-white shadow-card md:max-w-none md:flex-1 md:bg-caddy-cream md:shadow-none">
          <div className="app-scroll min-h-screen overflow-y-auto pb-24 md:pb-0">
            <div className="md:mx-auto md:max-w-3xl md:px-10 md:py-8">{children}</div>
          </div>
          <NavBar />
        </div>
      </div>
    </SessionProvider>
  );
}
