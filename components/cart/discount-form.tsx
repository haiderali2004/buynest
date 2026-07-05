"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

function DiscountForm() {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const removeDiscount = useCartStore((state) => state.removeDiscount);

  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleApply(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't apply that code.");
        return;
      }

      applyDiscount(data);
      setCode("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (discount) {
    return (
      <div className="flex items-center justify-between bg-secondary px-3 py-2.5 text-sm">
        <span>
          Code <span className="font-mono font-medium">{discount.code}</span> applied
          <span className="ml-1 text-muted-foreground">(-{formatPrice(discount.amount)})</span>
        </span>
        <button
          type="button"
          onClick={removeDiscount}
          aria-label="Remove promo code"
          className="text-muted-foreground hover:text-clay"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError(null);
          }}
          disabled={submitting}
          className="h-10 text-sm"
        />
        <Button type="submit" variant="outline" disabled={submitting || !code.trim()}>
          {submitting ? "Checking…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-clay">{error}</p>}
    </form>
  );
}

export { DiscountForm };
