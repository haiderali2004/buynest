import { prisma } from "@/lib/prisma";
import type { CartItemInput } from "@/lib/validations/checkout";
import { round2 } from "@/lib/orders/totals";
import { toNumber } from "@/lib/decimal";

export { computeOrderTotals, type OrderTotals } from "@/lib/orders/totals";

/** A checkout-specific error with an HTTP status to surface to the client. */
export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
  }
}

export interface PricedLineItem {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
}

export interface DiscountResult {
  discountId: string;
  code: string;
  discountType: "percentage" | "fixed_amount";
  value: number;
  amount: number;
}

/**
 * Re-prices every line in the cart against the database, the only source of
 * truth for price and stock. Never trust a unit price supplied by the
 * client — carts are client-persisted state and can be edited freely in
 * devtools.
 *
 * Throws `CheckoutError` (409) if a variant has been deactivated or no
 * longer has enough stock for the requested quantity.
 */
export async function priceCartItems(items: CartItemInput[]): Promise<PricedLineItem[]> {
  const variantIds = items.map((item) => item.variantId);

  const variants: Array<{
    id: string;
    size: string;
    color: string;
    stockQuantity: number;
    priceOverride: unknown;
    product: { id: string; name: string; basePrice: unknown; isActive: boolean };
  }> = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  return items.map((item) => {
    const variant = byId.get(item.variantId);

    if (!variant || !variant.product.isActive) {
      throw new CheckoutError("One of the items in your cart is no longer available.", 409);
    }

    if (variant.stockQuantity < item.quantity) {
      throw new CheckoutError(
        `Only ${variant.stockQuantity} left of "${variant.product.name}" (${variant.size} / ${variant.color}). Please update the quantity in your cart.`,
        409,
      );
    }

    const unitPrice = toNumber(variant.priceOverride ?? variant.product.basePrice);

    return {
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: item.quantity,
      lineSubtotal: round2(unitPrice * item.quantity),
    };
  });
}

export function getSubtotal(lineItems: PricedLineItem[]): number {
  return round2(lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0));
}

/**
 * Validates a promo code against the `discounts` table and computes the
 * discount amount for the given subtotal. Throws `CheckoutError` for any
 * invalid/expired/exhausted code so callers can surface a clear message.
 */
export async function resolveDiscount(code: string, subtotal: number): Promise<DiscountResult> {
  const normalizedCode = code.trim().toUpperCase();

  const discount: {
    id: string;
    code: string;
    discountType: string;
    value: unknown;
    minPurchaseAmount: unknown;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
    startsAt: Date;
    expiresAt: Date | null;
  } | null = await prisma.discount.findUnique({ where: { code: normalizedCode } });

  if (!discount || !discount.isActive) {
    throw new CheckoutError("That promo code isn't valid.", 404);
  }

  const now = new Date();
  if (discount.startsAt > now || (discount.expiresAt && discount.expiresAt < now)) {
    throw new CheckoutError("That promo code has expired.", 404);
  }

  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    throw new CheckoutError("That promo code has reached its usage limit.", 404);
  }

  const minPurchase = toNumber(discount.minPurchaseAmount);
  if (subtotal < minPurchase) {
    throw new CheckoutError(`Spend at least Rs ${minPurchase.toFixed(2)} to use this code.`, 400);
  }

  const value = toNumber(discount.value);
  const discountType = discount.discountType as "percentage" | "fixed_amount";
  const amount =
    discountType === "percentage" ? round2(subtotal * (value / 100)) : Math.min(value, subtotal);

  return { discountId: discount.id, code: discount.code, discountType, value, amount };
}
