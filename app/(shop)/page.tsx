import type { Metadata } from "next";
import { getFeaturedProducts, getCategoriesWithCounts } from "@/lib/products/queries";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewsletterBand } from "@/components/home/newsletter-band";

export const metadata: Metadata = {
  title: "BuyNest — Considered clothing, cut for the long run",
};

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProducts(4),
  ]);

  return (
    <>
      <Hero />
      <ValueProps />
      <CategoryShowcase categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <NewsletterBand />
    </>
  );
}
