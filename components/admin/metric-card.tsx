import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}

function MetricCard({ label, value, icon: Icon, accent = false }: MetricCardProps) {
  return (
    <div className="flex items-start justify-between border border-border bg-paper p-5">
      <div>
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
      </div>
      <Icon className={cn("size-5", accent ? "text-clay" : "text-bottle")} strokeWidth={1.5} />
    </div>
  );
}

export { MetricCard };
