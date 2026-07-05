import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/products/queries";

function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="font-display text-lg text-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">Try adjusting or clearing your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export { ProductGrid };
