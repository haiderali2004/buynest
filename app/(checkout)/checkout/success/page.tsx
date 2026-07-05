import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchTrackerStatus } from "@/lib/payments/safepay";
import { finalizeSucceededPayment } from "@/lib/orders/finalize-order";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface OrderForSuccess {
  orderNumber: string;
  paymentStatus: string;
  totalAmount: unknown;
  safepayTrackerToken: string | null;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    variantDetailsSnapshot: unknown;
    quantity: number;
    subtotal: unknown;
  }>;
}

async function getOrder(orderNumber: string): Promise<OrderForSuccess | null> {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, shippingAddress: true },
  });
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  if (!orderNumber) {
    notFound();
  }

  let order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  // The webhook usually wins this race, but the redirect back from
  // Safepay's hosted checkout can land first. Cross-check directly with
  // Safepay rather than leaving the page stuck on "confirming" for a
  // payment that actually went through — `finalizeSucceededPayment` is
  // idempotent, so this is safe to run even if the webhook fires a moment
  // later too.
  if (order.paymentStatus !== "paid" && order.safepayTrackerToken) {
    const tracker = await fetchTrackerStatus(order.safepayTrackerToken);
    if (tracker.isSucceeded) {
      await finalizeSucceededPayment({
        trackerToken: order.safepayTrackerToken,
        amountPkr: Number(order.totalAmount),
      });
      order = await getOrder(orderNumber);
    }
  }

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      {isPaid && <ClearCartOnSuccess />}

      {isPaid ? (
        <>
          <p className="font-mono text-xs tracking-wider text-bottle uppercase">
            Order confirmed
          </p>
          <h1 className="mt-3 font-display text-3xl text-foreground">Thank you</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order <span className="font-mono text-foreground">{order.orderNumber}</span> has been
            placed. A confirmation has been sent to your email.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl text-foreground">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This can take a few seconds. Refresh this page if it doesn&rsquo;t update shortly.
          </p>
        </>
      )}

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
        <span>Total</span>
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
