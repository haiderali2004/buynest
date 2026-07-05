import type { Metadata } from "next";
import { getProducts, getProductFilterFacets, parseProductFilters } from "@/lib/products/queries";
import { CatalogView } from "@/components/product/catalog-view";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  return { title: query ? `Search: ${query}` : "Search" };
}

function buildHref(filters: ReturnType<typeof parseProductFilters>, targetPage: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.categorySlug) params.set("category", filters.categorySlug);
  filters.sizes?.forEach((size) => params.append("size", size));
  filters.colors?.forEach((color) => params.append("color", color));
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : "/search";
}

export default async function SearchPage({
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

  const title = filters.search ? `Search results for "${filters.search}"` : "Search";

  return (
    <CatalogView
      title={title}
      total={total}
      products={products}
      facets={facets}
      page={page}
      pageCount={pageCount}
      buildHref={(targetPage) => buildHref(filters, targetPage)}
    />
  );
}
