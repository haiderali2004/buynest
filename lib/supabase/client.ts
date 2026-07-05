import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for the browser (Client Components, event handlers).
 * Cookie storage is handled automatically by @supabase/ssr — there is no
 * need to wire up document.cookie manually here.
 *
 * Call this once per component tree (e.g. inside a hook or at module scope
 * of the client component that needs it); @supabase/ssr internally reuses
 * a single underlying client per browser tab.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
