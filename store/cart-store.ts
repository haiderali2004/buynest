import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLineItem } from "@/types";

export interface AppliedDiscount {
  code: string;
  discountType: "percentage" | "fixed_amount";
  value: number;
  /** Discount amount in PKR for the cart contents at the time it was applied. */
  amount: number;
}

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  discount: AppliedDiscount | null;
  addItem: (item: CartLineItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;
}

/**
 * Guest-cart state, persisted to localStorage so it survives reloads and
 * closed tabs. This is intentionally local-only for now: when account pages
 * exist, a signed-in user's cart can additionally sync to the `cart_items`
 * table (from the Phase 1 schema) so it follows them across devices — this
 * store would become the optimistic local mirror of that server state
 * rather than the sole source of truth.
 *
 * `isOpen` is UI-only state for the slide-out cart and is deliberately left
 * out of `partialize` below, so a reload never reopens the drawer.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      discount: null,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);

          const items = existing
            ? state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              )
            : [...state.items, item];

          // Adding something is the moment the slide-out is most useful —
          // it gives immediate confirmation without leaving the page.
          return { items, isOpen: true };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.variantId !== variantId) };
          }
          return {
            items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
          };
        }),

      clearCart: () => set({ items: [], discount: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyDiscount: (discount) => set({ discount }),
      removeDiscount: () => set({ discount: null }),
    }),
    {
      name: "buynest-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, discount: state.discount }),
    },
  ),
);

/** Total number of units in the cart (sum of quantities, not line count). */
export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

/** Cart subtotal in INR, before any discount/shipping/tax. */
export function useCartSubtotal() {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
}
