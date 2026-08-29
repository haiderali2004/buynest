import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

/**
 * Landing page for Cash on Delivery orders. Unlike the card flow, there's
 * no payment to confirm here — the order is placed for real the moment
 * checkout created it, so this page is a plain "you're set, pay on
 * delivery" receipt rather than anything that waits on a payment status.
 */
export default async function CheckoutConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shippingAddress: true },
  });

  if (!order || order.paymentMethod !== "cod") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <ClearCartOnSuccess />

      <p className="font-mono text-xs tracking-wider text-bottle uppercase">Order placed</p>
      <h1 className="mt-3 font-display text-3xl text-foreground">Thank you</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.orderNumber}</span> has been
        placed. Pay in cash when it arrives — a confirmation has been sent to your email.
      </p>

      <div className="mt-10 divide-y divide-border border-y border-border text-left">
        {order.items.map((item) => {
          const details = item.variantDetailsSnapshot as { size?: string; color?: string } | null;
          return (
            <div key={item.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <p className="text-foreground">{item.productNameSnapshot}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {details?.size} / {details?.color} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-mono text-foreground">{formatPrice(Number(item.subtotal))}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between font-display text-lg text-foreground">
        <span>Total due on delivery</span>
        <span>{formatPrice(Number(order.totalAmount))}</span>
      </div>

      {order.shippingAddress && (
        <div className="mt-10 text-left">
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Shipping to
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
        </div>
      )}

      <Button asChild size="lg" className="mt-10">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}
