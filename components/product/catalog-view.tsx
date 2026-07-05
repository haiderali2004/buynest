import { Suspense } from "react";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { SortSelect } from "@/components/product/sort-select";
import type { ProductCardData, ProductFilterFacets } from "@/lib/products/queries";

interface CatalogViewProps {
  title: string;
  total: number;
  products: ProductCardData[];
  facets: ProductFilterFacets;
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
  hideSortSelect?: boolean;
}

function CatalogView({
  title,
  total,
  products,
  facets,
  page,
  pageCount,
  buildHref,
  hideSortSelect = false,
}: CatalogViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} item{total === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <Suspense>
          <ProductFilters facets={facets} />
        </Suspense>

        <div>
          {!hideSortSelect && (
            <div className="mb-6 flex justify-end">
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>
          )}
          <ProductGrid products={products} />
          <ProductPagination page={page} pageCount={pageCount} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}

export { CatalogView };
