import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-xl tracking-tight text-ink">
            BuyNest
          </Link>
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
