import { createClient } from "@/lib/supabase/server";

export class UnauthenticatedError extends Error {}

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  isAnonymous: boolean;
}

/** Throws UnauthenticatedError if there's no session at all. Unlike requireAdmin, this allows anonymous sessions through — callers that need a "real" account (not a guest-checkout session) should check `isAnonymous` themselves. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    throw new UnauthenticatedError("Sign in required.");
  }

  return {
    id: claims.sub,
    email: claims.email ?? null,
    isAnonymous: Boolean(claims.is_anonymous),
  };
}
