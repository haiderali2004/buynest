"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { cn } from "@/lib/utils";
import type { ProductDetailVariant } from "@/lib/products/queries";

interface AddToCartPanelProps {
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  variants: ProductDetailVariant[];
}

function AddToCartPanel({
  productId,
  productName,
  productSlug,
  image,
  variants,
}: AddToCartPanelProps) {
  const addItem = useCartStore((state) => state.addItem);

  const sizes = React.useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const colors = React.useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);

  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    sizes.length === 1 ? sizes[0]! : null,
  );
  const [selectedColorRaw, setSelectedColorRaw] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  // Derived rather than synced via an effect: if the previously clicked
  // color isn't offered for the now-selected size, fall back to the only
  // option (or none) for that size. This sidesteps an extra render pass
  // and a "reset on prop change" effect entirely.
  const colorsForSize = selectedSize ? variants.filter((v) => v.size === selectedSize) : [];
  const colorStillValid = colorsForSize.some((v) => v.color === selectedColorRaw);
  const selectedColor = colorStillValid
    ? selectedColorRaw
    : colorsForSize.length === 1
      ? colorsForSize[0]!.color
      : null;

  const selectedVariant =
    variants.find((v) => v.size === selectedSize && v.color === selectedColor) ?? null;

  function handleAddToCart() {
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productName,
      productSlug,
      image,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: selectedVariant.price,
      quantity,
    });

    toast.success(`Added ${productName} to your cart.`);
    setQuantity(1);
  }

  const outOfStock = selectedVariant?.stockQuantity === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((size) => {
            const hasStock = variants.some((v) => v.size === size && v.stockQuantity > 0);
            return (
              <button
                key={size}
                type="button"
                disabled={!hasStock}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "flex h-11 min-w-11 items-center justify-center border px-3 font-mono text-sm transition-colors",
                  selectedSize === size
                    ? "border-bottle bg-bottle text-paper"
                    : "border-border text-foreground hover:border-bottle",
                  !hasStock && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((color) => {
            const variantForColor = selectedSize
              ? variants.find((v) => v.size === selectedSize && v.color === color)
              : variants.find((v) => v.color === color);
            const available = selectedSize
              ? Boolean(variantForColor) && variantForColor!.stockQuantity > 0
              : true;

            return (
              <button
                key={color}
                type="button"
                disabled={!available}
                onClick={() => setSelectedColorRaw(color)}
                className={cn(
                  "border px-3 py-2 font-mono text-xs transition-colors",
                  selectedColor === color
                    ? "border-bottle bg-bottle text-paper"
                    : "border-border text-foreground hover:border-bottle",
                  !available && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {selectedVariant && (
        <p className="font-mono text-xs text-muted-foreground">
          {selectedVariant.stockQuantity === 0
            ? "Out of stock"
            : selectedVariant.stockQuantity <= 5
              ? `Only ${selectedVariant.stockQuantity} left`
              : "In stock"}
        </p>
      )}

      <div className="flex items-center gap-4">
        <QuantityStepper
          quantity={quantity}
          onIncrease={() => setQuantity((q) => Math.min(q + 1, selectedVariant?.stockQuantity ?? 10))}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={!selectedVariant || outOfStock}
        />
        <Button
          size="lg"
          className="flex-1"
          disabled={!selectedVariant || outOfStock}
          onClick={handleAddToCart}
        >
          {!selectedSize || !selectedColor
            ? "Select size & color"
            : outOfStock
              ? "Out of stock"
              : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}

export { AddToCartPanel };
