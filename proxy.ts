import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (the
// exported function must be named `proxy`, not `middleware`) to better
// reflect that this runs as a network boundary, not an Express-style
// middleware chain. It defaults to the Node.js runtime, which is what we
// want here since @supabase/ssr relies on Node-compatible APIs.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization
     * files, where there's no session to refresh and no point paying the
     * cost of a proxy invocation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
