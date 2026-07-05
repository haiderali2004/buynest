import { describe, it, expect } from "vitest";
import { adminDiscountSchema } from "@/lib/validations/admin-discount";

const base = {
  code: "summer20",
  discountType: "percentage" as const,
  value: 20,
  isActive: true,
};

describe("adminDiscountSchema", () => {
  it("uppercases the code", () => {
    const result = adminDiscountSchema.parse(base);
    expect(result.code).toBe("SUMMER20");
  });

  it("rejects a percentage discount over 100", () => {
    const result = adminDiscountSchema.safeParse({ ...base, value: 150 });
    expect(result.success).toBe(false);
  });

  it("allows a fixed-amount discount over 100 (it's a currency amount, not a percentage)", () => {
    const result = adminDiscountSchema.safeParse({
      ...base,
      discountType: "fixed_amount",
      value: 500,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative value", () => {
    expect(adminDiscountSchema.safeParse({ ...base, value: 0 }).success).toBe(false);
    expect(adminDiscountSchema.safeParse({ ...base, value: -10 }).success).toBe(false);
  });

  it("defaults minPurchaseAmount to 0 when omitted", () => {
    const result = adminDiscountSchema.parse(base);
    expect(result.minPurchaseAmount).toBe(0);
  });

  it("rejects an empty code", () => {
    expect(adminDiscountSchema.safeParse({ ...base, code: "" }).success).toBe(false);
  });
});
