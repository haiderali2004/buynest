import type { Metadata } from "next";
import { getCategoryOptions } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-foreground">Add Product</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
