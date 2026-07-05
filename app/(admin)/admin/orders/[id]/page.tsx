import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/admin/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  return { title: order ? `Order ${order.orderNumber}` : "Order not found" };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleString("en-PK")}
          </p>
        </div>
        <Badge>{order.paymentStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="border border-border bg-paper">
            <p className="border-b border-border px-5 py-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Items
            </p>
            <div className="divide-y divide-border">
              {order.items.map((item) => {
                const details = item.variantDetailsSnapshot as {
                  size?: string;
                  color?: string;
                } | null;
                return (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="text-foreground">{item.productNameSnapshot}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {details?.size} / {details?.color} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono text-foreground">{formatPrice(item.subtotal)}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-1.5 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="font-mono text-bottle">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-mono text-foreground">{formatPrice(order.shippingAmount)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground">
                <span>Total</span>
                <span className="font-mono">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border border-border bg-paper">
            <p className="border-b border-border px-5 py-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Status History
            </p>
            <div className="divide-y divide-border">
              {order.statusHistory.map((event) => (
                <div key={event.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <Badge variant="secondary">{event.status}</Badge>
                    {event.note && <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {event.createdAt.toLocaleString("en-PK")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Update status
            </p>
            <div className="mt-3">
              <OrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
                currentCarrier={order.carrier}
                currentTrackingNumber={order.trackingNumber}
                currentTrackingUrl={order.trackingUrl}
              />
            </div>
          </div>

          {order.shippingAddress && (
            <div className="border border-border bg-paper p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Ship to
              </p>
              <p className="mt-2 text-sm text-foreground">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
