import { describe, it, expect } from "vitest";
import { computeOrderTotals, round2 } from "@/lib/orders/totals";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_RATE } from "@/lib/constants";

describe("round2", () => {
  it("rounds to 2 decimal places", () => {
    expect(round2(19.005)).toBe(19.01);
    expect(round2(10)).toBe(10);
  });

  it("handles the classic floating point case (0.1 + 0.2)", () => {
    // 0.1 + 0.2 === 0.30000000000000004 in IEEE754 — this is exactly the
    // kind of bug that silently corrupts money math if round2 didn't exist.
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe("computeOrderTotals", () => {
  it("applies the flat shipping rate below the free-shipping threshold", () => {
    const totals = computeOrderTotals(FREE_SHIPPING_THRESHOLD - 1, 0);
    expect(totals.shippingAmount).toBe(FLAT_SHIPPING_RATE);
  });

  it("gives free shipping exactly at the threshold", () => {
    const totals = computeOrderTotals(FREE_SHIPPING_THRESHOLD, 0);
    expect(totals.shippingAmount).toBe(0);
  });

  it("gives free shipping above the threshold", () => {
    const totals = computeOrderTotals(FREE_SHIPPING_THRESHOLD + 500, 0);
    expect(totals.shippingAmount).toBe(0);
  });

  it("checks the free-shipping threshold against the subtotal AFTER discount, not before", () => {
    // Subtotal alone clears the threshold, but a discount brings the
    // post-discount amount below it — shipping should NOT be free here.
    const subtotal = FREE_SHIPPING_THRESHOLD + 100;
    const discount = 200;
    const totals = computeOrderTotals(subtotal, discount);
    expect(totals.shippingAmount).toBe(FLAT_SHIPPING_RATE);
  });

  it("never lets a discount larger than the subtotal produce a negative total", () => {
    const totals = computeOrderTotals(500, 10000);
    expect(totals.totalAmount).toBeGreaterThanOrEqual(0);
    // Discounted subtotal clamps to 0, so total is just the shipping rate.
    expect(totals.totalAmount).toBe(FLAT_SHIPPING_RATE);
  });

  it("always reports tax as 0 (no tax integration yet — see lib/orders/pricing.ts)", () => {
    const totals = computeOrderTotals(1000, 0);
    expect(totals.taxAmount).toBe(0);
  });

  it("rounds the final total even when inputs have more than 2 decimal places", () => {
    const totals = computeOrderTotals(99.999, 0.001);
    expect(Number.isInteger(totals.totalAmount * 100)).toBe(true);
  });
});
