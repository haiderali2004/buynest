"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { CartLineItemRow } from "@/components/cart/cart-line-item";
import { EmptyCart } from "@/components/cart/empty-cart";
import { formatPrice } from "@/lib/utils";

function CartSheet() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartSubtotal();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyCart onAction={closeCart} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartLineItemRow key={item.variantId} item={item} compact />
                ))}
              </div>
            </div>

            <div className="border-t border-border p-5">
              <div className="mb-4 flex items-center justify-between font-mono text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Shipping, tax, and any promo code are calculated at checkout.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" onClick={closeCart}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
                <SheetClose asChild>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/cart">View cart</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { CartSheet };
