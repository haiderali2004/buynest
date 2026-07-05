import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmptyCart({ onAction }: { onAction?: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1.25} />
      <div>
        <p className="font-display text-lg text-foreground">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Items you add will show up here.
        </p>
      </div>
      <Button asChild onClick={onAction}>
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}

export { EmptyCart };
