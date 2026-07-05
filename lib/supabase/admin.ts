import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. This BYPASSES Row Level Security entirely,
 * so it must only ever be used in trusted server-only code — Route Handlers
 * that have already verified the caller, webhook handlers (Safepay, etc.),
 * and admin-only Server Actions that perform their own authorization check.
 *
 * NEVER import this file from a Client Component, and never forward
 * `SUPABASE_SERVICE_ROLE_KEY` to the browser. There is no cookie-based
 * session here on purpose — this client acts as the platform itself, not
 * as any particular user.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. The admin client must not be used without it.",
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
