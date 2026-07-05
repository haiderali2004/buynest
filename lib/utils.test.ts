import { describe, it, expect } from "vitest";
import { formatPrice, getInitials, cn } from "@/lib/utils";

describe("formatPrice", () => {
  // Intl.NumberFormat("en-PK") inserts a NO-BREAK SPACE (U+00A0) between
  // "Rs" and the number, not a regular space (U+0020) — this constant
  // exists so nobody has to rediscover that the hard way, the way this
  // test suite did on its first run.
  const NBSP = "\u00A0";

  it("formats with the Rs PKR prefix by default", () => {
    expect(formatPrice(2499)).toBe(`Rs${NBSP}2,499.00`);
  });

  it("accepts a numeric string", () => {
    expect(formatPrice("2499")).toBe(`Rs${NBSP}2,499.00`);
  });

  it("returns an empty string for non-numeric input rather than throwing", () => {
    expect(formatPrice("not a number")).toBe("");
  });

  it("respects an explicit currency override", () => {
    expect(formatPrice(10, "USD", "en-US")).toBe("$10.00");
  });
});

describe("getInitials", () => {
  it("returns the first letter of each of the first and last name", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("falls back to the first two letters for a single name", () => {
    expect(getInitials("Madonna")).toBe("MA");
  });

  it("returns '?' for null, undefined, or empty input", () => {
    expect(getInitials(null)).toBe("?");
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});

describe("cn", () => {
  it("merges class names and lets a later conflicting utility win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("foo", false && "bar", undefined, "baz")).toBe("foo baz");
  });
});
