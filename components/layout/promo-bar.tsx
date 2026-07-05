import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

function PromoBar() {
  return (
    <div className="bg-bottle px-4 py-2 text-center font-mono text-[11px] tracking-wide text-paper">
      Complimentary shipping on orders over Rs {FREE_SHIPPING_THRESHOLD.toLocaleString("en-PK")} · 30-day returns
    </div>
  );
}

export { PromoBar };
