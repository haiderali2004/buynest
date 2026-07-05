"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";
import type { WishlistLineItem } from "@/types";

function WishlistButton({ item, className }: { item: WishlistLineItem; className?: string }) {
  const hydrated = useIsHydrated();
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(item.productId));
  const toggleItem = useWishlistStore((state) => state.toggleItem);

  const active = hydrated && isWishlisted;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggleItem(item);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-paper/90 text-foreground shadow-sm transition-colors hover:bg-paper",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-clay text-clay")} />
    </button>
  );
}

export { WishlistButton };
