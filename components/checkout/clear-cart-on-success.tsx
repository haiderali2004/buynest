"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Side-effect-only component: clears the persisted cart once mounted on a
 * confirmed order. Kept separate from the (Server Component) success page
 * since touching Zustand state has to happen on the client.
 */
function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}

export { ClearCartOnSuccess };
