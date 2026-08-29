import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products/queries";
import { getProductReviews, getReviewEligibility } from "@/lib/products/reviews";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailGrid } from "@/components/product/product-detail-grid";
import { KitContents } from "@/components/product/kit-contents";
import { ReviewsSection } from "@/components/product/reviews-section";

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

      <ProductDetailGrid product={product} primaryImage={primaryImage} onSale={onSale} />

      <KitContents kitContents={product.kitContents} />

      <ReviewsSection slug={slug} reviews={reviews} eligibility={eligibility} />
    </div>
  );
}
