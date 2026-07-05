import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
  carrier: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url("Enter a valid URL").max(500).optional().or(z.literal("")),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
