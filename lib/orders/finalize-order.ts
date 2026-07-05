import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";
import { sendOrderConfirmationEmail } from "@/lib/email/notifications";

export type FinalizeResult =
  | { status: "finalized"; orderId: string }
  | { status: "already_finalized"; orderId: string }
  | { status: "not_found" };

export interface SucceededPaymentInput {
  trackerToken: string;
  amountPkr: number;
  rawEvent?: unknown;
}

/**
 * Marks an order paid from a succeeded Safepay payment. Safe to call more
 * than once for the same tracker — both the webhook and the checkout
 * success page call this, and webhooks themselves are not guaranteed to
 * fire exactly once.
 *
 * Stock is decremented at checkout creation now, not here — see
 * `app/api/checkout/route.ts` and migration 0005. By the time a payment
 * succeeds, the stock for this order was already reserved; this function
 * only needs to record the payment and clear the reservation expiry so
 * `release_expired_reservations()` never touches a paid order.
 */
export async function finalizeSucceededPayment(
  input: SucceededPaymentInput,
): Promise<FinalizeResult> {
  const order: {
    id: string;
    orderNumber: string;
    paymentStatus: string;
    discountId: string | null;
    totalAmount: unknown;
    customerEmail: string | null;
    items: Array<{
      variantId: string;
      quantity: number;
      productNameSnapshot: string;
      variantDetailsSnapshot: unknown;
      subtotal: unknown;
    }>;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
  } | null = await prisma.order.findFirst({
    where: { safepayTrackerToken: input.trackerToken },
    include: { items: true, shippingAddress: true },
  });

  if (!order) return { status: "not_found" };
  if (order.paymentStatus === "paid") return { status: "already_finalized", orderId: order.id };

  type FinalizeTx = {
    order: { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> };
    paymentTransaction: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
    orderStatusHistory: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
    discount: { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> };
  };

  await prisma.$transaction(async (tx: FinalizeTx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "paid", paymentStatus: "paid", reservationExpiresAt: null },
    });

    await tx.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: "safepay",
        providerReference: input.trackerToken,
        amount: input.amountPkr,
        currency: "PKR",
        status: "succeeded",
        rawEvent: input.rawEvent ? JSON.parse(JSON.stringify(input.rawEvent)) : undefined,
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: "paid", note: "Payment confirmed via Safepay." },
    });

    if (order.discountId) {
      await tx.discount.update({
        where: { id: order.discountId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  if (order.customerEmail) {
    await sendOrderConfirmationEmail({
      to: order.customerEmail,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => {
        const details = item.variantDetailsSnapshot as { size?: string; color?: string } | null;
        return {
          name: item.productNameSnapshot,
          size: details?.size ?? "",
          color: details?.color ?? "",
          quantity: item.quantity,
          subtotal: toNumber(item.subtotal),
        };
      }),
      totalAmount: toNumber(order.totalAmount),
      shippingAddress: order.shippingAddress,
    });
  }

  return { status: "finalized", orderId: order.id };
}

/**
 * Records a failed payment attempt and immediately gives the reserved
 * stock back — there's no reason to make a customer who's about to retry
 * (or another shopper who wants the last unit) wait out the full 30
 * minute reservation window for stock that's clearly not going to be
 * paid for on this attempt.
 */
export async function recordFailedPayment(input: {
  trackerToken: string;
  failureMessage?: string;
}): Promise<void> {
  const order: {
    id: string;
    status: string;
    paymentStatus: string;
    items: Array<{ variantId: string; quantity: number }>;
  } | null = await prisma.order.findFirst({
    where: { safepayTrackerToken: input.trackerToken },
    select: { id: true, status: true, paymentStatus: true, items: { select: { variantId: true, quantity: true } } },
  });

  if (!order || order.paymentStatus === "paid") return;

  type FailTx = {
    order: { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> };
    orderStatusHistory: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
    $executeRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
  };

  await prisma.$transaction(async (tx: FailTx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "cancelled", paymentStatus: "failed", reservationExpiresAt: null },
    });

    for (const item of order.items) {
      await tx.$executeRaw`UPDATE public.product_variants SET stock_quantity = stock_quantity + ${item.quantity}::int WHERE id = ${item.variantId}::uuid`;
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "cancelled",
        note: input.failureMessage ?? "Payment failed — reserved stock released.",
      },
    });
  });
}
