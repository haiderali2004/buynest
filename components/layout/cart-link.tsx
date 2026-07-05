"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartCount, useCartStore } from "@/store/cart-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { TagBadge } from "@/components/shared/tag-badge";

function CartLink({ transparent = false }: { transparent?: boolean }) {
  const count = useCartCount();
  const openCart = useCartStore((state) => state.openCart);
  const hydrated = useIsHydrated();

  const displayCount = hydrated ? count : 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${displayCount} item${displayCount === 1 ? "" : "s"}`}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-full transition-colors duration-300",
        transparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary",
      )}
    >
      <ShoppingBag className="size-5" />
      {displayCount > 0 && (
        <TagBadge className="absolute -top-1 -right-1">{displayCount}</TagBadge>
      )}
    </button>
  );
}

export { CartLink };
