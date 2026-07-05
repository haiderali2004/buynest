import { z } from "zod";

export const adminDiscountSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .max(64)
      .transform((value) => value.trim().toUpperCase()),
    description: z.string().max(200).optional(),
    discountType: z.enum(["percentage", "fixed_amount"]),
    value: z.number().positive("Value must be greater than 0"),
    minPurchaseAmount: z.number().min(0).default(0),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine((data) => data.discountType !== "percentage" || data.value <= 100, {
    message: "Percentage discounts can't exceed 100",
    path: ["value"],
  });

export type AdminDiscountInput = z.infer<typeof adminDiscountSchema>;
