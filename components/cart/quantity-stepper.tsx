"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  disabled,
  size = "md",
}: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "size-7" : "size-8";

  return (
    <div className="inline-flex items-center border border-border">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Decrease quantity"
        className={`flex ${buttonSize} items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40`}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-[2rem] text-center font-mono text-sm" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        className={`flex ${buttonSize} items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export { QuantityStepper };
