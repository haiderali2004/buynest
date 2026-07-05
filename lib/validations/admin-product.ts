import { z } from "zod";

export const adminVariantSchema = z.object({
  /** Present when editing an existing variant; absent for a new one. */
  id: z.string().uuid().optional(),
  size: z.string().min(1, "Size is required").max(20),
  color: z.string().min(1, "Color is required").max(40),
  colorHex: z.string().max(20).optional(),
  stockQuantity: z.number().int().min(0, "Stock can't be negative"),
  priceOverride: z.number().min(0).optional(),
});

export const adminImageSchema = z.object({
  url: z.string().min(1, "Image URL is required").max(500),
  isPrimary: z.boolean(),
});

export const adminProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().uuid().optional(),
  material: z.string().max(200).optional(),
  careInstructions: z.string().max(500).optional(),
  basePrice: z.number().min(0, "Price can't be negative"),
  compareAtPrice: z.number().min(0).optional(),
  isActive: z.boolean(),
  images: z.array(adminImageSchema).min(1, "Add at least one image"),
  variants: z.array(adminVariantSchema).min(1, "Add at least one variant"),
});

export type AdminVariantInput = z.infer<typeof adminVariantSchema>;
export type AdminImageInput = z.infer<typeof adminImageSchema>;
export type AdminProductInput = z.infer<typeof adminProductSchema>;
