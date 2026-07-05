import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and keeps the
 * session cookies in sync between the browser and the server.
 *
 * This MUST run in `proxy.ts` (Next.js 16's renamed `middleware.ts`
 * convention). Server Components are not allowed to write cookies, so
 * without this, an expiring access token would never get refreshed and
 * users would be logged out unpredictably.
 *
 * Do not add other logic between `createServerClient` and
 * `supabase.auth.getClaims()` below — that gap is where subtle, hard-to-debug
 * session bugs creep in (per the Supabase SSR docs).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Make the refreshed cookies visible to the rest of this request
          // (e.g. Server Components rendered after this middleware runs).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // This call is what actually triggers the refresh and the setAll callback
  // above when the access token is close to expiring.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
