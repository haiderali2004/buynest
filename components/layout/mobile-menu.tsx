"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { NavCategory, NavUser } from "@/types";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: NavUser | null;
  categories: NavCategory[];
}

function MobileMenu({ open, onOpenChange, user, categories }: MobileMenuProps) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const openCart = useCartStore((state) => state.openCart);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0">
        <SheetHeader>
          <SheetTitle>BuyNest</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col">
            {categories.map((category) => (
              <li key={category.id} className="border-b border-border">
                <div className="flex items-center justify-between py-3">
                  <SheetClose asChild>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-base text-foreground"
                    >
                      {category.name}
                    </Link>
                  </SheetClose>

                  {category.children.length > 0 && (
                    <button
                      type="button"
                      aria-label={`Toggle ${category.name} submenu`}
                      onClick={() =>
                        setExpanded((current) => (current === category.id ? null : category.id))
                      }
                      className="flex size-8 items-center justify-center text-muted-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          expanded === category.id && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>

                {category.children.length > 0 && expanded === category.id && (
                  <ul className="flex flex-col gap-2.5 pb-3 pl-3">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <SheetClose asChild>
                          <Link
                            href={`/categories/${child.slug}`}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li className="border-b border-border py-3">
              <SheetClose asChild>
                <Link href="/new-in" className="text-base text-foreground">
                  New In
                </Link>
              </SheetClose>
            </li>
            <li className="border-b border-border py-3">
              <SheetClose asChild>
                <Link href="/sale" className="text-base text-clay">
                  Sale
                </Link>
              </SheetClose>
            </li>
          </ul>

          <Separator className="my-5" />

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {user.fullName ?? user.email}
                </p>
                <SheetClose asChild>
                  <Link href="/account" className="text-sm text-foreground">
                    My account
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/account/orders" className="text-sm text-foreground">
                    Order history
                  </Link>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link href="/login" className="text-sm font-medium text-foreground">
                    Sign in
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/register" className="text-sm text-muted-foreground">
                    Create an account
                  </Link>
                </SheetClose>
              </>
            )}

            <Separator className="my-2" />

            <SheetClose asChild>
              <Link href="/wishlist" className="text-sm text-foreground">
                Wishlist
              </Link>
            </SheetClose>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                openCart();
              }}
              className="text-left text-sm text-foreground"
            >
              Cart
            </button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export { MobileMenu };
