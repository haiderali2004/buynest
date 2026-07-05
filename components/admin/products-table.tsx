import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { AdminProductListItem } from "@/lib/admin/products";

function ProductsTable({ products }: { products: AdminProductListItem[] }) {
  if (products.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted-foreground">No products yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3">Price</th>
            <th className="px-5 py-3">Stock</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden bg-secondary">
                    {product.image && (
                      <Image src={product.image} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <span className="text-foreground">{product.name}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-muted-foreground">{product.categoryName ?? "—"}</td>
              <td className="px-5 py-3 font-mono text-foreground">
                {formatPrice(product.basePrice)}
              </td>
              <td className="px-5 py-3 font-mono text-foreground">
                {product.totalStock === 0 ? (
                  <span className="text-clay">0</span>
                ) : (
                  product.totalStock
                )}
              </td>
              <td className="px-5 py-3">
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-mono text-xs text-bottle hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ProductsTable };
