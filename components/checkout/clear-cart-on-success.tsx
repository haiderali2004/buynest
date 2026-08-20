"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Side-effect-only component: clears the persisted cart once mounted on a
 * confirmed order. Kept separate from the (Server Component) success page
 * since touching Zustand state has to happen on the client.
 *
 * Waits for the persist middleware to finish reading localStorage before
 * clearing — calling clearCart() while that read is still in flight lets
 * it "win" afterward and silently restore the pre-checkout cart, which is
 * exactly the bug this guards against (confirmed live: the purchased item
 * reappeared in the cart right after a successful order).
 */
function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  React.useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      clearCart();
      return;
    }

    return useCartStore.persist.onFinishHydration(() => {
      clearCart();
    });
  }, [clearCart]);

  return null;
}

export { ClearCartOnSuccess };
