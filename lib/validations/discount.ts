import { z } from "zod";
import { cartItemInputSchema } from "@/lib/validations/checkout";

export const discountValidateSchema = z.object({
  code: z.string().min(1, "Enter a code").max(64),
  items: z.array(cartItemInputSchema).min(1, "Your cart is empty"),
});

export type DiscountValidateInput = z.infer<typeof discountValidateSchema>;
