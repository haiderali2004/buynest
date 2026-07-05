import { z } from "zod";

export const cartItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const addressInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  phone: z.string().min(6, "Enter a valid phone number").max(20),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
});

export const checkoutInputSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    items: z.array(cartItemInputSchema).min(1, "Your cart is empty"),
    shippingAddress: addressInputSchema,
    billingSameAsShipping: z.boolean(),
    billingAddress: addressInputSchema.optional(),
    discountCode: z
      .string()
      .trim()
      .toUpperCase()
      .max(64)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : undefined)),
  })
  .refine((data) => data.billingSameAsShipping || data.billingAddress, {
    message: "Billing address is required",
    path: ["billingAddress"],
  });

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
