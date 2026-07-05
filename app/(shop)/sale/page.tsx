import type { Metadata } from "next";
import { getProducts, getProductFilterFacets, parseProductFilters } from "@/lib/products/queries";
import { CatalogView } from "@/components/product/catalog-view";

export const metadata: Metadata = {
  title: "Sale",
};

function buildHref(filters: ReturnType<typeof parseProductFilters>, targetPage: number) {
  const params = new URLSearchParams();
  filters.sizes?.forEach((size) => params.append("size", size));
  filters.colors?.forEach((color) => params.append("color", color));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/sale?${queryString}` : "/sale";
}

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = { ...parseProductFilters(rawParams), onSaleOnly: true };

  const [{ products, total, page, pageCount }, facets] = await Promise.all([
    getProducts(filters),
    getProductFilterFacets(),
  ]);

  return (
    <CatalogView
      title="Sale"
      total={total}
      products={products}
      facets={facets}
      page={page}
      pageCount={pageCount}
      buildHref={(targetPage) => buildHref(filters, targetPage)}
    />
  );
}
