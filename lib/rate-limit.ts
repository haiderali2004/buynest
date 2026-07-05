import { prisma } from "@/lib/prisma";

interface RateLimitOptions {
  /** A bucket identity — typically `<route>:<ip>` or `<route>:<email>`. */
  key: string;
  /** Max allowed events within the window. */
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
}

/**
 * A sliding-window rate limiter backed by Postgres rather than Redis —
 * this app already has a database, so it uses that instead of requiring
 * a new account with a service like Upstash. Costs one extra read query
 * (and, when allowed, one extra write) per protected request — a
 * reasonable trade at this scale.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - options.windowSeconds * 1000);

  const rows: Array<{ count: bigint }> = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM rate_limit_events
    WHERE bucket_key = ${options.key} AND created_at > ${windowStart}
  `;
  const count = Number(rows[0]?.count ?? 0);

  if (count >= options.limit) {
    return { allowed: false };
  }

  await prisma.$executeRaw`INSERT INTO rate_limit_events (bucket_key) VALUES (${options.key})`;

  // Opportunistic cleanup so the table doesn't grow forever — only runs
  // on roughly 1% of requests rather than every one, since it's not
  // needed for correctness, only housekeeping.
  if (Math.random() < 0.01) {
    await prisma.$executeRaw`SELECT public.cleanup_old_rate_limit_events()`;
  }

  return { allowed: true };
}

/**
 * Best-effort client IP from standard proxy headers. Falls back to a
 * constant when none are present (e.g. local dev) — every unidentified
 * request then shares one bucket, which is intentionally conservative
 * rather than effectively unlimited.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
