import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/product/review-form";
import { cn } from "@/lib/utils";
import type { ProductReview, ReviewEligibility } from "@/lib/products/reviews";

function StaticStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            "size-4",
            rating >= value ? "fill-brass text-brass" : "fill-none text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

interface ReviewsSectionProps {
  slug: string;
  reviews: ProductReview[];
  eligibility: ReviewEligibility | null;
}

function ReviewsSection({ slug, reviews, eligibility }: ReviewsSectionProps) {
  return (
    <div className="mt-16 border-t border-border pt-10">
      <h2 className="font-display text-2xl text-foreground">Reviews</h2>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-2">
                    <StaticStars rating={review.rating} />
                    {review.isVerifiedPurchase && (
                      <Badge variant="secondary">Verified purchase</Badge>
                    )}
                  </div>
                  {review.title && (
                    <p className="mt-2 text-sm font-medium text-foreground">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {review.reviewerName} · {review.createdAt.toLocaleDateString("en-PK")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:w-80">
          {eligibility?.canReview && <ReviewForm slug={slug} />}
          {eligibility?.alreadyReviewed && (
            <p className="text-sm text-muted-foreground">
              You&rsquo;ve already reviewed this product.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { ReviewsSection };
