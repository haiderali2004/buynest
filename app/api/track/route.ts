import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const trackSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  // Generous limit — this fires on every page navigation for every
  // visitor, so it needs a much higher ceiling than a form submission.
  const rateLimit = await checkRateLimit({
    key: `track:${getClientIp(request)}`,
    limit: 200,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await prisma.pageView.create({
      data: { path: parsed.data.path, referrer: parsed.data.referrer || null },
    });
  } catch (error) {
    // Never let a tracking failure be visible to the visitor — this is
    // pure telemetry, not a feature anything else depends on.
    console.error("[track] failed", error);
  }

  return NextResponse.json({ ok: true });
}
