import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts } from "@/lib/admin/products";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      <div className="border border-border bg-paper">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
