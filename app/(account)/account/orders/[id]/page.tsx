import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountOrderById } from "@/lib/account/orders";
import { getReturnableOrderItems, getReturnForOrder } from "@/lib/account/returns";
import { RequestReturnButton } from "@/components/account/request-return-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { title: "Order" };

  const order = await getAccountOrderById(data.claims.sub, id);
  return { title: order ? `Order ${order.orderNumber}` : "Order not found" };
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data!.claims;

  const order = await getAccountOrderById(claims.sub, id);

  if (!order) {
    notFound();
  }

  const [returnableItems, existingReturn] = await Promise.all([
    getReturnableOrderItems(claims.sub, id),
    getReturnForOrder(claims.sub, id),
  ]);

  const canRequestReturn =
    !existingReturn && returnableItems.some((item) => item.returnableQuantity > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-foreground">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleDateString("en-PK")}
          </p>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="border border-border bg-paper">
          <div className="divide-y divide-border">
            {order.items.map((item) => {
              const details = item.variantDetailsSnapshot as {
                size?: string;
                color?: string;
              } | null;
              return (
                <div key={item.id} className="flex items-center justify-between px-5 py-4 text-sm">
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

        <div className="flex flex-col gap-6">
          {order.trackingUrl && (
            <div className="border border-border bg-paper p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Tracking
              </p>
              <p className="mt-2 text-sm text-foreground">
                {order.carrier && <>{order.carrier} · </>}
                {order.trackingNumber}
              </p>
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-bottle hover:underline"
              >
                Track package →
              </a>
            </div>
          )}

          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Status
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {order.statusHistory.map((event) => (
                <div key={event.id}>
                  <Badge variant="secondary">{event.status}</Badge>
                  {event.note && <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>}
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {event.createdAt.toLocaleString("en-PK")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="border border-border bg-paper p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Shipped to
              </p>
              <p className="mt-2 text-sm text-foreground">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Returns
            </p>
            {existingReturn ? (
              <div className="mt-3">
                <Badge variant="secondary">{existingReturn.status.replace("_", " ")}</Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  A return for this order is already in progress.
                </p>
              </div>
            ) : canRequestReturn ? (
              <div className="mt-3">
                <RequestReturnButton orderId={order.id} items={returnableItems} />
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {order.paymentStatus === "paid"
                  ? "Nothing left to return on this order."
                  : "Returns are available once an order is paid."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
