import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/auth/require-user";
import { reviewSchema } from "@/lib/validations/review";
import { getReviewEligibility } from "@/lib/products/reviews";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimit = await checkRateLimit({
    key: `review:${getClientIp(request)}`,
    limit: 10,
    windowSeconds: 60 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    throw error;
  }

  const { slug } = await params;

  const product: { id: string } | null = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid review." },
      { status: 400 },
    );
  }

  // Re-checked server-side regardless of what the UI showed — never trust
  // the client to have correctly gated this.
  const eligibility = await getReviewEligibility(userId, product.id);

  if (!eligibility.canReview) {
    return NextResponse.json(
      {
        message: eligibility.alreadyReviewed
          ? "You've already reviewed this product."
          : "You can only review products you've purchased.",
      },
      { status: 403 },
    );
  }

  try {
    await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        orderItemId: eligibility.orderItemId,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        comment: parsed.data.comment || null,
        isVerifiedPurchase: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[reviews] create failed", error);
    return NextResponse.json({ message: "Couldn't submit your review." }, { status: 500 });
  }
}
