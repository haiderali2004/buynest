import type { Metadata } from "next";
import {
  getFeaturedProducts,
  getSpotlightProducts,
  getCatalogStats,
} from "@/lib/products/queries";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { Departments } from "@/components/home/departments";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Spotlight } from "@/components/home/spotlight";
import { BrandStory } from "@/components/home/brand-story";
import { NotesSection } from "@/components/home/notes-section";
import { NewsletterBand } from "@/components/home/newsletter-band";

export const metadata: Metadata = {
  title: "BuyNest — Supplies for curious minds",
};

export default async function HomePage() {
  const [featuredProducts, spotlightProducts, catalogStats] = await Promise.all([
    getFeaturedProducts(6),
    getSpotlightProducts(2),
    getCatalogStats(),
  ]);

  return (
    <>
      <Hero pinnedProducts={featuredProducts} />
      <ValueProps />
      <Departments />
      <FeaturedProducts products={featuredProducts.slice(0, 4)} />
      <Spotlight products={spotlightProducts} />
      <BrandStory stats={catalogStats} />
      <NotesSection />
      <NewsletterBand />
    </>
  );
}
