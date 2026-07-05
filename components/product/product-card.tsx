import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/product/star-rating";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ProductImage } from "@/components/product/product-image";
import type { ProductCardData } from "@/lib/products/queries";

function ProductCard({ product }: { product: ProductCardData }) {
  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.basePrice;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden bg-secondary">
        {product.image ? (
          <ProductImage
            src={product.image}
            alt={product.name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
            No image
          </div>
        )}

        {onSale && (
          <span className="absolute top-3 left-3 bg-clay px-2 py-1 font-mono text-[10px] tracking-wide text-paper uppercase">
            Sale
          </span>
        )}

        <WishlistButton
          item={{
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            image: product.image,
            price: product.basePrice,
          }}
          className="absolute top-3 right-3"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <p className="relative inline-block text-sm text-foreground after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] group-hover:after:scale-x-100">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-foreground">
            {formatPrice(product.basePrice)}
          </span>
          {onSale && (
            <span className="font-mono text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <StarRating rating={product.avgRating} reviewCount={product.reviewCount} />
      </div>
    </Link>
  );
}

export { ProductCard };
