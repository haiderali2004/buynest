/**
 * Lightweight domain types shared across client components and stores.
 * These are intentionally NOT generated from Prisma — they describe just
 * the shape the UI needs, which keeps client bundles independent of the
 * full Prisma schema. Server code should still prefer the real Prisma
 * types (`import type { Product } from "@prisma/client"`) for queries.
 */

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: NavCategory[];
}

export interface CartLineItem {
  /** product_variants.id — the unique key for a cart line */
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
}

export interface WishlistLineItem {
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  price: number;
}

export interface NavUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}
