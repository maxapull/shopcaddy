import { ClipboardCheck, Database, KeyRound } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function SetupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="rounded-xl2 border border-caddy-orange-light bg-white p-6 shadow-card">
        <h1 className="text-lg font-bold text-caddy-ink">ShopCaddy needs a database</h1>
        <p className="mt-1 text-sm text-caddy-gray">
          This is a one-time setup step — nothing is broken. ShopCaddy stores accounts, budgets
          and lists in a Supabase project, and it isn&rsquo;t connected yet.
        </p>

        <ol className="mt-5 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
              <Database size={14} />
            </span>
            <p className="text-sm text-caddy-ink">
              Create a free project at{" "}
              <span className="font-semibold">supabase.com</span>.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
              <ClipboardCheck size={14} />
            </span>
            <p className="text-sm text-caddy-ink">
              Open the SQL Editor, paste in the contents of{" "}
              <code className="rounded bg-caddy-cream px-1 py-0.5 text-xs">supabase/schema.sql</code>{" "}
              from this repo, and run it once.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
              <KeyRound size={14} />
            </span>
            <p className="text-sm text-caddy-ink">
              Copy the Project URL and anon public key (Settings → API) into{" "}
              <code className="rounded bg-caddy-cream px-1 py-0.5 text-xs">.env.local</code>{" "}
              locally, and into your Vercel project&rsquo;s Environment Variables, then redeploy.
            </p>
          </li>
        </ol>

        <p className="mt-5 text-xs text-caddy-gray">
          Full step-by-step instructions are in <span className="font-semibold">SETUP.md</span>{" "}
          at the root of the repo.
        </p>
      </div>
    </div>
  );
}
