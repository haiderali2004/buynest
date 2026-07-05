import { prisma } from "@/lib/prisma";

export interface AdminCategoryListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parentName: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

export async function getAdminCategories(): Promise<AdminCategoryListItem[]> {
  const categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parentId: string | null;
    displayOrder: number;
    isActive: boolean;
    parent: { name: string } | null;
    _count: { products: number };
  }> = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    parentId: category.parentId,
    parentName: category.parent?.name ?? null,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
    productCount: category._count.products,
  }));
}

export interface CategoryParentOption {
  id: string;
  name: string;
}

/** Top-level categories only, as parent options — categories here are kept to two levels (parent + children). */
export async function getCategoryParentOptions(excludeId?: string): Promise<CategoryParentOption[]> {
  return prisma.category.findMany({
    where: { parentId: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
