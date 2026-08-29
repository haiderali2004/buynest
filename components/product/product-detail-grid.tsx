"use client";

import * as React from "react";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { StarRating } from "@/components/product/star-rating";
import { WishlistButton } from "@/components/product/wishlist-button";
import { formatPrice } from "@/lib/utils";
import type { ProductDetailData } from "@/lib/products/queries";

interface ProductDetailGridProps {
  product: ProductDetailData;
  primaryImage: string | null;
  onSale: boolean;
}

/**
 * Owns the one piece of state the gallery and the variant picker need to
 * share (the selected color) — split out from the (Server Component) page
 * since that state has to live on the client.
 */
function ProductDetailGrid({ product, primaryImage, onSale }: ProductDetailGridProps) {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <ProductGallery images={product.images} productName={product.name} selectedColor={selectedColor} />

      <div>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {product.brand}
        </p>

        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl text-foreground">{product.name}</h1>
          <WishlistButton
            item={{
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              image: primaryImage,
              price: product.basePrice,
            }}
            className="shrink-0 bg-secondary"
          />
        </div>

        <div className="mt-3">
          <StarRating rating={product.avgRating} reviewCount={product.reviewCount} size="md" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-xl text-foreground">{formatPrice(product.basePrice)}</span>
          {onSale && (
            <span className="font-mono text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-foreground">{product.description}</p>

        <div className="mt-8 border-t border-border pt-8">
          <AddToCartPanel
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            image={primaryImage}
            variants={product.variants}
            onColorChange={setSelectedColor}
          />
        </div>

        {(product.material || product.careInstructions) && (
          <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8">
            {product.material && (
              <div>
                <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  Material
                </p>
                <p className="mt-1 text-sm text-foreground">{product.material}</p>
              </div>
            )}
            {product.careInstructions && (
              <div>
                <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  Care
                </p>
                <p className="mt-1 text-sm text-foreground">{product.careInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { ProductDetailGrid };
