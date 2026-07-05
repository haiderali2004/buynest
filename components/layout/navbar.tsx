"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/layout/search-dialog";
import { AccountMenu } from "@/components/layout/account-menu";
import { CartLink } from "@/components/layout/cart-link";
import { WishlistLink } from "@/components/layout/wishlist-link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartSheet } from "@/components/cart/cart-sheet";
import type { NavCategory, NavUser } from "@/types";

interface NavbarProps {
  user: NavUser | null;
  categories: NavCategory[];
}

function Navbar({ user, categories }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const hero = document.getElementById("hero");

    if (!hero) {
      // No hero on this page — always show solid navbar
      setScrolled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  function openMenu(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(id);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  }

  // Nav text/icons stay light in both states: white over the hero image,
  // and white against the solid bottle-green bar once scrolled.
  const transparent = true;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 border-b transition-all duration-500 ease-in-out",
        scrolled
          ? "bg-bottle border-bottle-hover shadow-[0_1px_0_0_var(--color-bottle-hover)]"
          : "bg-transparent border-transparent shadow-[0_1px_0_0_transparent]",
      )}
    >

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors lg:hidden",
            transparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary",
          )}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          className="lg:flex-1"
          aria-label="BuyNest home"
        >
          <Image
            src="/logo.png"
            alt="BuyNest"
            width={187}
            height={68}
            priority
            className="h-18.75 w-auto"
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-start gap-7 lg:flex"
          onMouseLeave={scheduleClose}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              onMouseEnter={() => openMenu(category.id)}
            >
              <Link
                href={`/categories/${category.slug}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium tracking-wide transition-all duration-300",
                  transparent
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : "text-foreground hover:bg-secondary hover:text-bottle",
                )}
              >
                {category.name}
              </Link>

              {category.children.length > 0 && activeMenu === category.id && (
                <div
                  className="absolute inset-x-0 top-full z-40 border-y border-border bg-paper shadow-lg"
                  onMouseEnter={() => openMenu(category.id)}
                >
                  <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-8 py-8">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        onClick={() => setActiveMenu(null)}
                        className="text-sm text-foreground transition-colors hover:text-bottle"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Link
            href="/new-in"
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium tracking-wide transition-all duration-300",
              transparent
                ? "text-white/90 hover:bg-white/10 hover:text-white"
                : "text-foreground hover:bg-secondary hover:text-bottle",
            )}
          >
            New In
          </Link>
          <Link
            href="/sale"
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium tracking-wide transition-all duration-300",
              transparent ? "text-white/90 hover:bg-white/10 hover:text-white" : "text-clay hover:bg-secondary hover:text-clay/70",
            )}
          >
            Sale
          </Link>
        </nav>

        <div className="flex items-center gap-1 lg:flex-1 lg:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-colors duration-300",
              transparent && "text-white hover:bg-white/10",
            )}
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>
          <WishlistLink transparent={transparent} />
          <AccountMenu user={user} transparent={transparent} />
          <CartLink transparent={transparent} />
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} categories={categories} />
      <MobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        user={user}
        categories={categories}
      />
      <CartSheet />
    </header>
  );
}

export { Navbar };
