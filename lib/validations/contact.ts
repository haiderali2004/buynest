import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, "Message is required").max(2000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
