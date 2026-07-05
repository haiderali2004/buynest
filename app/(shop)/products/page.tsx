import type { Metadata } from "next";
import { getProducts, getProductFilterFacets, parseProductFilters } from "@/lib/products/queries";
import { CatalogView } from "@/components/product/catalog-view";

export const metadata: Metadata = {
  title: "All Products",
};

function buildHref(filters: ReturnType<typeof parseProductFilters>, targetPage: number) {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set("category", filters.categorySlug);
  filters.sizes?.forEach((size) => params.append("size", size));
  filters.colors?.forEach((color) => params.append("color", color));
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = parseProductFilters(rawParams);

  const [{ products, total, page, pageCount }, facets] = await Promise.all([
    getProducts(filters),
    getProductFilterFacets(),
  ]);

  return (
    <CatalogView
      title="All Products"
      total={total}
      products={products}
      facets={facets}
      page={page}
      pageCount={pageCount}
      buildHref={(targetPage) => buildHref(filters, targetPage)}
    />
  );
}
