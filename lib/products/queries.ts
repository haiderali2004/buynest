import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export const PRODUCTS_PAGE_SIZE = 12;

const KNOWN_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

/** Sorts clothing sizes in wearable order (XS..XXL), falling back to numeric/alpha for things like waist sizes. */
function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = KNOWN_SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = KNOWN_SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

export type ProductSort = "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  categorySlug?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  /** Only products with a compare-at price set — see note in getProducts(). */
  onSaleOnly?: boolean;
  /** Free-text match against product name/description. */
  search?: string;
}

/** Parses raw Next.js searchParams (string | string[] | undefined) into typed filters. */
export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProductFilters {
  const toArray = (value: string | string[] | undefined): string[] | undefined => {
    if (!value) return undefined;
    return Array.isArray(value) ? value : [value];
  };

  const toNum = (value: string | string[] | undefined): number | undefined => {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = raw ? Number(raw) : undefined;
    return parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined;
  };

  const sortRaw = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const sort: ProductSort =
    sortRaw === "price-asc" || sortRaw === "price-desc" ? sortRaw : "newest";

  const pageRaw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Math.max(1, Number(pageRaw) || 1);

  const searchRaw = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;

  return {
    categorySlug: Array.isArray(searchParams.category)
      ? searchParams.category[0]
      : searchParams.category,
    sizes: toArray(searchParams.size),
    colors: toArray(searchParams.color),
    minPrice: toNum(searchParams.minPrice),
    maxPrice: toNum(searchParams.maxPrice),
    sort,
    page,
    search: searchRaw?.trim() || undefined,
  };
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  avgRating: number;
  reviewCount: number;
  image: string | null;
}

export interface ProductListResult {
  products: ProductCardData[];
  total: number;
  page: number;
  pageCount: number;
}

export async function getProducts(filters: ProductFilters): Promise<ProductListResult> {
  const where: Record<string, unknown> = { isActive: true };

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.sizes?.length || filters.colors?.length) {
    where.variants = {
      some: {
        ...(filters.sizes?.length ? { size: { in: filters.sizes } } : {}),
        ...(filters.colors?.length ? { color: { in: filters.colors } } : {}),
      },
    };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.basePrice = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.onSaleOnly) {
    // Prisma can't directly express "compareAtPrice > basePrice" as a
    // column-to-column comparison without raw SQL. In this schema
    // compareAtPrice is only ever set when an item is intentionally on
    // sale (never as an unrelated "was" price that happens to be lower),
    // so "is set" is a correct and sufficient proxy here.
    where.compareAtPrice = { not: null };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    filters.sort === "price-asc"
      ? { basePrice: "asc" as const }
      : filters.sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  const page = filters.page ?? 1;

  const results: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: unknown;
    compareAtPrice: unknown;
    avgRating: unknown;
    reviewCount: number;
    images: Array<{ url: string }>;
  }> = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PRODUCTS_PAGE_SIZE,
    take: PRODUCTS_PAGE_SIZE,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  const total: number = await prisma.product.count({ where });

  return {
    products: results.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: toNumber(product.basePrice),
      compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
      avgRating: toNumber(product.avgRating),
      reviewCount: product.reviewCount,
      image: product.images[0]?.url ?? null,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE)),
  };
}

/**
 * For the home page "New Arrivals" rail. Prioritizes products explicitly
 * flagged `isFeatured`, then fills any remaining slots with the newest
 * active products — so the section is never empty just because no one has
 * flagged anything as featured yet (e.g. right after seeding).
 */
export async function getFeaturedProducts(limit: number = 4): Promise<ProductCardData[]> {
  const results: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: unknown;
    compareAtPrice: unknown;
    avgRating: unknown;
    reviewCount: number;
    images: Array<{ url: string }>;
  }> = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  return results.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: toNumber(product.basePrice),
    compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
    avgRating: toNumber(product.avgRating),
    reviewCount: product.reviewCount,
    image: product.images[0]?.url ?? null,
  }));
}

export interface CategoryWithCount {
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

/** Top-level categories with a live count of active products, for the home page category tiles. */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories: Array<{
    name: string;
    slug: string;
    imageUrl: string | null;
    _count: { products: number };
  }> = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { displayOrder: "asc" },
    select: {
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return categories
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
    }))
    .filter((category) => category.productCount > 0);
}

export interface ProductFilterFacets {
  categories: Array<{ name: string; slug: string }>;
  sizes: string[];
  colors: string[];
}

export async function getProductFilterFacets(): Promise<ProductFilterFacets> {
  const [categories, sizeRows, colorRows]: [
    Array<{ name: string; slug: string }>,
    Array<{ size: string }>,
    Array<{ color: string }>,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.productVariant.findMany({
      where: { product: { isActive: true } },
      distinct: ["size"],
      select: { size: true },
    }),
    prisma.productVariant.findMany({
      where: { product: { isActive: true } },
      distinct: ["color"],
      select: { color: true },
    }),
  ]);

  return {
    categories,
    sizes: sortSizes(sizeRows.map((row) => row.size)),
    colors: [...new Set(colorRows.map((row) => row.color))].sort(),
  };
}

export interface ProductDetailVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stockQuantity: number;
  price: number;
}

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  basePrice: number;
  compareAtPrice: number | null;
  material: string | null;
  careInstructions: string | null;
  avgRating: number;
  reviewCount: number;
  category: { name: string; slug: string } | null;
  images: Array<{ id: string; url: string; altText: string | null }>;
  variants: ProductDetailVariant[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    brand: string;
    basePrice: unknown;
    compareAtPrice: unknown;
    material: string | null;
    careInstructions: string | null;
    avgRating: unknown;
    reviewCount: number;
    category: { name: string; slug: string } | null;
    images: Array<{ id: string; url: string; altText: string | null }>;
    variants: Array<{
      id: string;
      size: string;
      color: string;
      colorHex: string | null;
      stockQuantity: number;
      priceOverride: unknown;
    }>;
  } | null = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { displayOrder: "asc" } },
      variants: true,
    },
  });

  if (!product) return null;

  const basePrice = toNumber(product.basePrice);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    basePrice,
    compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
    material: product.material,
    careInstructions: product.careInstructions,
    avgRating: toNumber(product.avgRating),
    reviewCount: product.reviewCount,
    category: product.category,
    images: product.images,
    variants: sortSizes([...new Set(product.variants.map((v) => v.size))]).flatMap((size) =>
      product.variants
        .filter((v) => v.size === size)
        .map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity,
          price: v.priceOverride ? toNumber(v.priceOverride) : basePrice,
        })),
    ),
  };
}
