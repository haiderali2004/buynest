import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_RATE } from "@/lib/constants";

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Pure pricing math shared by the server (checkout API) and the client
 * (live order-summary display). Deliberately has no dependency on Prisma
 * or any other server-only module so it's safe to import from Client
 * Components — the server remains the source of truth by re-running this
 * same function over database-fetched prices at checkout time.
 *
 * Tax is intentionally 0 — see the longer note in `lib/orders/pricing.ts`.
 */
export function computeOrderTotals(subtotal: number, discountAmount: number): OrderTotals {
  const discountedSubtotal = Math.max(round2(subtotal - discountAmount), 0);
  const shippingAmount = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const taxAmount = 0;
  const totalAmount = round2(discountedSubtotal + shippingAmount + taxAmount);

  return {
    subtotal: round2(subtotal),
    discountAmount: round2(discountAmount),
    shippingAmount,
    taxAmount,
    totalAmount,
  };
}
