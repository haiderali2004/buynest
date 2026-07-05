"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

function WishlistView() {
  const items = useWishlistStore((state) => state.items);
  // Avoid a flash of "empty wishlist" before the persisted store hydrates.
  const hydrated = useIsHydrated();

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Heart className="size-10 text-muted-foreground" strokeWidth={1.25} />
        <div>
          <p className="font-display text-lg text-foreground">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on anything you like the look of.
          </p>
        </div>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Your Wishlist</h1>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="group">
            <Link href={`/products/${item.productSlug}`} className="relative block aspect-3/4 overflow-hidden bg-secondary">
              {item.image ? (
                <ProductImage
                  src={item.image}
                  alt={item.productName}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
                  No image
                </div>
              )}
              <WishlistButton item={item} className="absolute top-3 right-3" />
            </Link>

            <div className="mt-3 flex flex-col gap-1">
              <Link
                href={`/products/${item.productSlug}`}
                className="relative inline-block text-sm text-foreground after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:text-bottle hover:after:scale-x-100"
              >
                {item.productName}
              </Link>
              <span className="font-mono text-sm text-foreground">{formatPrice(item.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { WishlistView };
