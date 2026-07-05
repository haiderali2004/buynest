"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Order History" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/settings", label: "Settings" },
];

function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-secondary font-medium text-bottle"
                : "text-foreground hover:bg-secondary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { AccountSidebar };
