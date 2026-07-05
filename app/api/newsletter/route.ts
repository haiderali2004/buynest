import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations/newsletter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit({
    key: `newsletter:${getClientIp(request)}`,
    limit: 5,
    windowSeconds: 60 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid email address.";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { email } = parsed.data;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { isActive: true },
    });

    if (existing?.isActive) {
      return NextResponse.json({ message: "You're already on the list." }, { status: 200 });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { isActive: true, unsubscribedAt: null, subscribedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Subscribed! Welcome to BuyNest." },
      { status: 201 },
    );
  } catch (error) {
    console.error("[newsletter] subscribe failed", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
