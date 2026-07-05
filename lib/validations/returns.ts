import { z } from "zod";

export const returnRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().min(1, "Please tell us why you're returning this").max(1000),
  customerNote: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        orderItemId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Select at least one item to return"),
});

export const RETURN_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "item_received",
  "refunded",
  "cancelled",
] as const;

export const returnStatusUpdateSchema = z.object({
  status: z.enum(RETURN_STATUSES),
  adminNote: z.string().max(1000).optional(),
  /** Required when transitioning to "refunded" — validated in the route, not here, since it's conditional on `status`. */
  refundAmount: z.number().min(0).optional(),
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
export type ReturnStatusUpdateInput = z.infer<typeof returnStatusUpdateSchema>;
