import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .email("Please enter a valid email address"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
