import { Truck, RotateCcw, ShieldCheck, Leaf } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

const VALUE_PROPS = [
  { icon: Truck, label: `Free shipping over Rs ${FREE_SHIPPING_THRESHOLD.toLocaleString("en-PK")}` },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Leaf, label: "Considered materials" },
];

function ValueProps() {
  return (
    <section className="border-b border-border bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {VALUE_PROPS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="size-5 shrink-0 text-bottle" strokeWidth={1.5} />
            <p className="text-sm text-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ValueProps };
