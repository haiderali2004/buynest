import { prisma } from "@/lib/prisma";

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  reviewerName: string;
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isVerifiedPurchase: boolean;
    createdAt: Date;
    user: { fullName: string | null };
  }> = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true } } },
  });

  return reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVerifiedPurchase: review.isVerifiedPurchase,
    createdAt: review.createdAt,
    reviewerName: review.user.fullName ?? "Anonymous",
  }));
}

export interface ReviewEligibility {
  /** A signed-in customer who's purchased this product and hasn't reviewed it yet. */
  canReview: boolean;
  alreadyReviewed: boolean;
  /** The purchased order item to link the review to, for the verified-purchase badge. */
  orderItemId: string | null;
}

/**
 * Reviews can only be written by someone who actually paid for this
 * product — enforced here (not just suggested in the UI), since the
 * write endpoint calls this same check before accepting a submission.
 */
export async function getReviewEligibility(
  userId: string,
  productId: string,
): Promise<ReviewEligibility> {
  const existing: { id: string } | null = await prisma.review.findFirst({
    where: { productId, userId },
    select: { id: true },
  });

  if (existing) {
    return { canReview: false, alreadyReviewed: true, orderItemId: null };
  }

  const purchasedOrderItem: { id: string } | null = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, paymentStatus: "paid" } },
    select: { id: true },
  });

  return {
    canReview: Boolean(purchasedOrderItem),
    alreadyReviewed: false,
    orderItemId: purchasedOrderItem?.id ?? null,
  };
}
