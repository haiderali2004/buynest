"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { CartLineItemRow } from "@/components/cart/cart-line-item";
import { EmptyCart } from "@/components/cart/empty-cart";
import { OrderSummary } from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";

function CartView() {
  const items = useCartStore((state) => state.items);
  // Avoid a flash of "empty cart" before the persisted store hydrates.
  const hydrated = useIsHydrated();

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <CartLineItemRow key={item.variantId} item={item} />
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary>
            <Button asChild size="lg" className="mt-1">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}

export { CartView };
