import { describe, it, expect } from "vitest";
import { reviewSchema } from "@/lib/validations/review";

describe("reviewSchema", () => {
  it("accepts a valid review", () => {
    const result = reviewSchema.safeParse({ rating: 5, title: "Great fit", comment: "Loved it." });
    expect(result.success).toBe(true);
  });

  it("rejects a rating of 0", () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it("rejects a rating above 5", () => {
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("rejects a non-integer rating", () => {
    expect(reviewSchema.safeParse({ rating: 4.5 }).success).toBe(false);
  });

  it("allows omitting title and comment", () => {
    expect(reviewSchema.safeParse({ rating: 3 }).success).toBe(true);
  });

  it("rejects a comment over the length limit", () => {
    const result = reviewSchema.safeParse({ rating: 3, comment: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
