import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Releases stock reservations from abandoned checkouts. The app already
 * does this lazily (right before pricing a new checkout attempt), so
 * nothing breaks if this endpoint is never called — but a real periodic
 * trigger (Vercel Cron, a GitHub Actions scheduled workflow, cron-job.org,
 * etc. hitting this URL every few minutes) releases abandoned stock
 * faster than waiting for someone else to start a checkout.
 *
 * Protected by a shared secret rather than admin auth, since schedulers
 * call this without a browser session — set CRON_SECRET and configure
 * your scheduler to send it as `Authorization: Bearer <secret>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const result: Array<{ release_expired_reservations: number }> = await prisma.$queryRaw`
      SELECT public.release_expired_reservations() as release_expired_reservations
    `;
    const releasedCount = result[0]?.release_expired_reservations ?? 0;

    return NextResponse.json({ releasedCount });
  } catch (error) {
    console.error("[cron/release-reservations] failed", error);
    return NextResponse.json({ message: "Release failed." }, { status: 500 });
  }
}
