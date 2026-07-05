import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAccountOrders } from "@/lib/account/orders";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order History",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "accent" | "destructive"> = {
  pending: "secondary",
  processing: "accent",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data!.claims;

  const orders = await getAccountOrders(claims.sub);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl text-foreground">Order History</h2>

      {orders.length === 0 ? (
        <div className="border border-border bg-paper px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">You haven&rsquo;t placed an order yet.</p>
          <Link href="/products" className="mt-3 inline-block text-sm text-bottle hover:underline">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="border border-border bg-paper">
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-secondary"
              >
                <div>
                  <p className="font-mono text-sm text-foreground">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-PK")} · {order.itemCount} item
                    {order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                    {order.status}
                  </Badge>
                  <span className="font-mono text-sm text-foreground">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
