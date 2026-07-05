import { describe, it, expect } from "vitest";
import { toNumber } from "@/lib/decimal";

describe("toNumber", () => {
  it("returns 0 for null and undefined", () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });

  it("passes plain numbers through unchanged", () => {
    expect(toNumber(42.5)).toBe(42.5);
    expect(toNumber(0)).toBe(0);
  });

  it("parses numeric strings", () => {
    expect(toNumber("19.99")).toBe(19.99);
  });

  it("coerces a Prisma-Decimal-like object via toString()", () => {
    // Prisma's actual Decimal class isn't imported here on purpose — this
    // tests the *contract* this function relies on (anything with a
    // numeric-looking toString()), not Prisma's specific implementation.
    const fakeDecimal = { toString: () => "1234.56" };
    expect(toNumber(fakeDecimal)).toBe(1234.56);
  });
});
