import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishlistLineItem } from "@/types";

interface WishlistState {
  items: WishlistLineItem[];
  toggleItem: (item: WishlistLineItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

/**
 * Guest-wishlist state, persisted to localStorage. As with the cart store,
 * a signed-in user's wishlist will additionally sync to the `wishlists`
 * table once account pages exist, so a returning signed-in user sees the
 * same list on any device.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, item],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      isWishlisted: (productId) => get().items.some((i) => i.productId === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "buynest-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useWishlistCount() {
  return useWishlistStore((state) => state.items.length);
}
