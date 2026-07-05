"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Percent, ShoppingCart, Undo2, ArrowLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/returns", label: "Returns", icon: Undo2 },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors hover:bg-secondary",
              active ? "bg-secondary font-medium text-bottle" : "text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-4 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
      >
        <ArrowLeft className="size-4" />
        Back to store
      </Link>
    </nav>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile top bar — the desktop sidebar below is hidden at this breakpoint */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-paper px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="BuyNest" width={99} height={54} className="h-8.75 w-auto shrink-0" />
          <span className="font-mono text-xs text-muted-foreground">Admin Panel</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open admin menu"
              className="flex size-9 items-center justify-center text-foreground"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
              <Image src="/logo-mark.png" alt="BuyNest" width={99} height={54} className="h-8.75 w-auto shrink-0" />
              <span className="font-mono text-xs text-muted-foreground">Admin Panel</span>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-paper lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="BuyNest" width={99} height={54} className="h-8.75 w-auto shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">Admin Panel</span>
          </Link>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}

export { AdminSidebar };
