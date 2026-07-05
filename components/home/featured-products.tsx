import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductCardData } from "@/lib/products/queries";

function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-border bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-foreground">New Arrivals</h2>
          <Link href="/new-in" className="font-mono text-xs text-muted-foreground hover:text-bottle">
            View all →
          </Link>
        </div>

        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}

export { FeaturedProducts };
