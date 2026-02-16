import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Placeholders so SSR/build does not throw when env is unset (e.g. in CI)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
