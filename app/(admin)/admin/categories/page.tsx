import type { Metadata } from "next";
import { getAdminCategories, getCategoryParentOptions } from "@/lib/admin/categories";
import { CategoriesTable } from "@/components/admin/categories-table";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const [categories, parentOptions] = await Promise.all([
    getAdminCategories(),
    getCategoryParentOptions(),
  ]);

  return <CategoriesTable categories={categories} parentOptions={parentOptions} />;
}
