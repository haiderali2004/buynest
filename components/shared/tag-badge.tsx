import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The brand's one recurring signature mark: a tiny clipped-corner "hang
 * tag" with a punched eyelet, standing in for the usual plain circular
 * count badge. Used for the cart/wishlist counts in the nav and for short
 * inline labels like "NEW".
 */
function TagBadge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-[18px] min-w-[18px] items-center justify-center bg-bottle pr-1.5 pl-2.5 font-mono text-[10px] leading-none font-semibold text-paper",
        className,
      )}
      style={{ clipPath: "polygon(7px 0, 100% 0, 100% 100%, 0 100%, 0 7px)" }}
    >
      <span
        aria-hidden
        className="absolute top-[3px] left-[3px] size-[3px] rounded-full border border-paper/80"
      />
      {children}
    </span>
  );
}

export { TagBadge };
