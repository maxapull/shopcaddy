import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Browser client — safe to use in client components. RLS on every table is
// what makes shipping the anon key to the browser safe.
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured — see SETUP.md.");
  }
  return createBrowserClient(env.url, env.anonKey);
}
