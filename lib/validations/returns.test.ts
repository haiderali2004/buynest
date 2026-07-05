import { describe, it, expect } from "vitest";
import { returnRequestSchema } from "@/lib/validations/returns";

const validOrderItemId = "11111111-1111-4111-8111-111111111111";
const validOrderId = "22222222-2222-4222-8222-222222222222";

describe("returnRequestSchema", () => {
  it("accepts a valid return request", () => {
    const result = returnRequestSchema.safeParse({
      orderId: validOrderId,
      reason: "Wrong size",
      items: [{ orderItemId: validOrderItemId, quantity: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty items array — a return must cover at least one item", () => {
    const result = returnRequestSchema.safeParse({
      orderId: validOrderId,
      reason: "Wrong size",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing reason", () => {
    const result = returnRequestSchema.safeParse({
      orderId: validOrderId,
      items: [{ orderItemId: validOrderItemId, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity of 0", () => {
    const result = returnRequestSchema.safeParse({
      orderId: validOrderId,
      reason: "Wrong size",
      items: [{ orderItemId: validOrderItemId, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID orderId", () => {
    const result = returnRequestSchema.safeParse({
      orderId: "not-a-uuid",
      reason: "Wrong size",
      items: [{ orderItemId: validOrderItemId, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});
