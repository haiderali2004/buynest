import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { AdminOrderListItem } from "@/lib/admin/orders";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "accent" | "destructive"> = {
  pending: "secondary",
  processing: "accent",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

function OrdersTable({ orders }: { orders: AdminOrderListItem[] }) {
  if (orders.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Payment</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-foreground hover:text-bottle"
                >
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-5 py-3 text-foreground">{order.customerName ?? "—"}</td>
              <td className="px-5 py-3">
                <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                  {order.status}
                </Badge>
              </td>
              <td className="px-5 py-3">
                <Badge
                  variant={
                    order.paymentStatus === "paid"
                      ? "default"
                      : order.paymentStatus === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </td>
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {order.createdAt.toLocaleDateString("en-PK")}
              </td>
              <td className="px-5 py-3 text-right font-mono text-foreground">
                {formatPrice(order.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { OrdersTable };
