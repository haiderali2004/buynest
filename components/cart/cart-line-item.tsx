"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { ProductImage } from "@/components/product/product-image";
import type { CartLineItem } from "@/types";

function CartLineItemRow({ item, compact = false }: { item: CartLineItem; compact?: boolean }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${item.productSlug}`}
        className={`relative shrink-0 overflow-hidden bg-secondary ${compact ? "size-20" : "size-28"}`}
      >
        {item.image ? (
          <ProductImage src={item.image} alt={item.productName} className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center font-mono text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              className="relative inline-block text-sm font-medium text-foreground after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:text-bottle hover:after:scale-x-100"
            >
              {item.productName}
            </Link>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {item.size} / {item.color}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.productName} from cart`}
            className="text-muted-foreground transition-colors hover:text-clay"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <QuantityStepper
            quantity={item.quantity}
            size={compact ? "sm" : "md"}
            onIncrease={() => updateQuantity(item.variantId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.variantId, item.quantity - 1)}
          />
          <p className="font-mono text-sm text-foreground">
            {formatPrice(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

export { CartLineItemRow };
