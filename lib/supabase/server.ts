import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for server-side code: Server Components, Route Handlers,
 * and Server Actions.
 *
 * IMPORTANT: Server Components can read cookies but cannot write them — any
 * `setAll` call made during a Server Component render is wrapped in a
 * try/catch below for exactly that reason. Token refreshes still work
 * correctly because `middleware.ts` refreshes the session on every request
 * and writes the updated cookies to the response. Route Handlers and Server
 * Actions *can* write cookies, so this same client works there too.
 *
 * Always call this once per request — never cache/reuse the returned client
 * across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component during render — cookies can't
            // be written here. Safe to ignore: middleware.ts refreshes the
            // session on every request, so the cookie will be set there.
          }
        },
      },
    },
  );
}
