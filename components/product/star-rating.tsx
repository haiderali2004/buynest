import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

function StarRating({ rating, reviewCount, size = "sm" }: StarRatingProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  if (reviewCount === 0 || reviewCount === undefined) {
    return <p className="font-mono text-xs text-muted-foreground">No reviews yet</p>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              starSize,
              index < Math.round(rating) ? "fill-brass text-brass" : "fill-none text-line-strong",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}

export { StarRating };
