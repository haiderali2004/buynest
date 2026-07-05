import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  isActive: boolean;
  categoryName: string | null;
  image: string | null;
  totalStock: number;
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const products: Array<{
    id: string;
    name: string;
    slug: string;
    basePrice: unknown;
    isActive: boolean;
    category: { name: string } | null;
    images: Array<{ url: string }>;
    variants: Array<{ stockQuantity: number }>;
  }> = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
      variants: { select: { stockQuantity: true } },
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: toNumber(product.basePrice),
    isActive: product.isActive,
    categoryName: product.category?.name ?? null,
    image: product.images[0]?.url ?? null,
    totalStock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
  }));
}

export interface AdminCategoryOption {
  id: string;
  name: string;
}

export async function getCategoryOptions(): Promise<AdminCategoryOption[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export interface AdminVariantDetail {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stockQuantity: number;
  priceOverride: number | null;
}

export interface AdminImageDetail {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  material: string | null;
  careInstructions: string | null;
  isActive: boolean;
  categoryId: string | null;
  images: AdminImageDetail[];
  variants: AdminVariantDetail[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: unknown;
    compareAtPrice: unknown;
    material: string | null;
    careInstructions: string | null;
    isActive: boolean;
    categoryId: string | null;
    images: Array<{ id: string; url: string; isPrimary: boolean; displayOrder: number }>;
    variants: Array<{
      id: string;
      size: string;
      color: string;
      colorHex: string | null;
      stockQuantity: number;
      priceOverride: unknown;
    }>;
  } | null = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { displayOrder: "asc" } }, variants: true },
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: toNumber(product.basePrice),
    compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
    material: product.material,
    careInstructions: product.careInstructions,
    isActive: product.isActive,
    categoryId: product.categoryId,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      stockQuantity: variant.stockQuantity,
      priceOverride: variant.priceOverride ? toNumber(variant.priceOverride) : null,
    })),
  };
}
