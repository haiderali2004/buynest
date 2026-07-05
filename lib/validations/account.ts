import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(120),
  phone: z.string().max(20).optional(),
});

export const accountAddressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(1, "Full name is required").max(120),
  phone: z.string().min(6, "Enter a valid phone number").max(20),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  isDefault: z.boolean().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AccountAddressInput = z.infer<typeof accountAddressSchema>;
