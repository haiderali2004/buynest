import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface AdminUser {
  id: string;
  role: string;
  fullName: string | null;
}

/**
 * Verifies the current session belongs to an admin (or super_admin).
 * Throws `UnauthorizedError` with a 401 (no session) or 403 (signed in,
 * but not an admin) — callers decide what to do with that distinction
 * (the admin layout redirects differently for each; API routes just
 * forward the status code).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    throw new UnauthorizedError("Sign in required.", 401);
  }

  const profile: { role: string; fullName: string | null } | null =
    await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true, fullName: true },
    });

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new UnauthorizedError("Admin access required.", 403);
  }

  return { id: userId, role: profile.role, fullName: profile.fullName };
}
