"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistCount } from "@/store/wishlist-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { TagBadge } from "@/components/shared/tag-badge";

function WishlistLink({ transparent = false }: { transparent?: boolean }) {
  const count = useWishlistCount();
  const hydrated = useIsHydrated();

  const displayCount = hydrated ? count : 0;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${displayCount} item${displayCount === 1 ? "" : "s"}`}
      className={cn(
        "relative hidden size-10 items-center justify-center rounded-full transition-colors duration-300 sm:flex",
        transparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary",
      )}
    >
      <Heart className="size-5" />
      {displayCount > 0 && (
        <TagBadge className="absolute -top-1 -right-1">{displayCount}</TagBadge>
      )}
    </Link>
  );
}

export { WishlistLink };
