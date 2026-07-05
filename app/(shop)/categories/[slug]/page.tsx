import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getProducts, getProductFilterFacets, parseProductFilters } from "@/lib/products/queries";
import { CatalogView } from "@/components/product/catalog-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category: { name: string } | null = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });

  return { title: category?.name ?? "Category" };
}

function buildHref(
  slug: string,
  filters: { sizes?: string[]; colors?: string[]; minPrice?: number; maxPrice?: number; sort?: string },
  targetPage: number,
) {
  const params = new URLSearchParams();
  filters.sizes?.forEach((size) => params.append("size", size));
  filters.colors?.forEach((color) => params.append("color", color));
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (targetPage > 1) params.set("page", String(targetPage));

  const queryString = params.toString();
  return queryString ? `/categories/${slug}?${queryString}` : `/categories/${slug}`;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const rawParams = await searchParams;

  const category: { id: string; name: string } | null = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true },
  });

  if (!category) {
    notFound();
  }

  const filters = { ...parseProductFilters(rawParams), categorySlug: slug };

  const [{ products, total, page, pageCount }, facets] = await Promise.all([
    getProducts(filters),
    getProductFilterFacets(),
  ]);

  return (
    <CatalogView
      title={category.name}
      total={total}
      products={products}
      facets={facets}
      page={page}
      pageCount={pageCount}
      buildHref={(targetPage) => buildHref(slug, filters, targetPage)}
    />
  );
}
