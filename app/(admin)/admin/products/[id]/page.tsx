import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductById, getCategoryOptions } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);
  return { title: product ? `Edit — ${product.name}` : "Product not found" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getCategoryOptions()]);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-foreground">Edit Product</h1>
      <ProductForm mode="edit" productId={product.id} categories={categories} initialValues={product} />
    </div>
  );
}
