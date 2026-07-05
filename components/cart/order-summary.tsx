"use client";

import type { ReactNode } from "react";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { computeOrderTotals } from "@/lib/orders/totals";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { DiscountForm } from "@/components/cart/discount-form";

interface OrderSummaryProps {
  showDiscountForm?: boolean;
  children?: ReactNode;
}

function OrderSummary({ showDiscountForm = true, children }: OrderSummaryProps) {
  const subtotal = useCartSubtotal();
  const discount = useCartStore((state) => state.discount);
  const totals = computeOrderTotals(subtotal, discount?.amount ?? 0);
  const remainingForFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discountAmount),
    0,
  );

  return (
    <div className="flex flex-col gap-5 border border-border bg-paper p-6">
      <p className="font-display text-lg text-foreground">Order Summary</p>

      {remainingForFreeShipping > 0 ? (
        <p className="font-mono text-xs text-muted-foreground">
          Add {formatPrice(remainingForFreeShipping)} more for free shipping
        </p>
      ) : (
        <p className="font-mono text-xs text-bottle">You&rsquo;ve unlocked free shipping</p>
      )}

      {showDiscountForm && <DiscountForm />}

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono text-foreground">{formatPrice(totals.subtotal)}</span>
        </div>
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="font-mono text-bottle">-{formatPrice(totals.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="font-mono text-foreground">
            {totals.shippingAmount === 0 ? "Free" : formatPrice(totals.shippingAmount)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="font-mono text-foreground">{formatPrice(totals.taxAmount)}</span>
        </div>
      </div>

      <div className="flex justify-between border-t border-border pt-4 font-display text-lg text-foreground">
        <span>Total</span>
        <span>{formatPrice(totals.totalAmount)}</span>
      </div>

      {children}
    </div>
  );
}

export { OrderSummary };
