// Centralised check for the two env vars every Supabase client needs.
// Used to fail with a clear "/setup" redirect instead of a cryptic runtime
// crash when the project hasn't been configured yet (see SETUP.md).
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
