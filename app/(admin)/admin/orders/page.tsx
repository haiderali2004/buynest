import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/admin/orders";
import { OrdersTable } from "@/components/admin/orders-table";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} total</p>
      </div>
      <div className="border border-border bg-paper">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
