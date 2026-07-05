import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products/queries";
import { getProductReviews, getReviewEligibility } from "@/lib/products/reviews";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product/product-gallery";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { StarRating } from "@/components/product/star-rating";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ReviewsSection } from "@/components/product/reviews-section";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  // Anonymous (guest-checkout) sessions aren't a real account that could
  // own a review, so eligibility is simply "no" for them, not an error.
  const [reviews, eligibility] = await Promise.all([
    getProductReviews(product.id),
    claims && !claims.is_anonymous ? getReviewEligibility(claims.sub, product.id) : null,
  ]);

  const onSale = product.compareAtPrice !== null && product.compareAtPrice > product.basePrice;
  const primaryImage = product.images[0]?.url ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 font-mono text-xs text-muted-foreground">
        <Link href="/products" className="hover:text-bottle">
          All Products
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/categories/${product.category.slug}`} className="hover:text-bottle">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

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
            <span className="font-mono text-xl text-foreground">
              {formatPrice(product.basePrice)}
            </span>
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

      <ReviewsSection slug={slug} reviews={reviews} eligibility={eligibility} />
    </div>
  );
}
