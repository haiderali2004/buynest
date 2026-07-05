import type { Metadata } from "next";
import { getProducts, getProductFilterFacets, parseProductFilters } from "@/lib/products/queries";
import { CatalogView } from "@/components/product/catalog-view";

export const metadata: Metadata = {
  title: "New In",
};

function buildHref(filters: ReturnType<typeof parseProductFilters>, targetPage: number) {
  const params = new URLSearchParams();
  filters.sizes?.forEach((size) => params.append("size", size));
  filters.colors?.forEach((color) => params.append("color", color));
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/new-in?${queryString}` : "/new-in";
}

export default async function NewInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  // "New In" is just the catalog sorted newest-first — sort is fixed here
  // rather than left to the visitor, since changing it would defeat the
  // point of the page.
  const filters = { ...parseProductFilters(rawParams), sort: "newest" as const };

  const [{ products, total, page, pageCount }, facets] = await Promise.all([
    getProducts(filters),
    getProductFilterFacets(),
  ]);

  return (
    <CatalogView
      title="New In"
      total={total}
      products={products}
      facets={facets}
      page={page}
      pageCount={pageCount}
      buildHref={(targetPage) => buildHref(filters, targetPage)}
      hideSortSelect
    />
  );
}
