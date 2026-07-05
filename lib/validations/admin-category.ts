import { z } from "zod";

export const adminCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  imageUrl: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean(),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
