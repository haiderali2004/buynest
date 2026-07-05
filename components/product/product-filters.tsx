"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ProductFilterFacets } from "@/lib/products/queries";

function FilterContent({
  facets,
  onApply,
}: {
  facets: ProductFilterFacets;
  onApply?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentSizes = searchParams.getAll("size");
  const currentColors = searchParams.getAll("color");
  const [minPrice, setMinPrice] = React.useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get("maxPrice") ?? "");

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  }

  function toggleMultiValue(key: string, value: string) {
    updateParams((params) => {
      const values = params.getAll(key);
      params.delete(key);
      const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      next.forEach((v) => params.append(key, v));
    });
  }

  function setCategory(slug: string | null) {
    // Category switches always go to the main catalog — a category page
    // (`/categories/[slug]`) represents exactly one category, so "switch
    // category" means leaving it rather than mutating its own route.
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
    onApply?.();
  }

  function applyPriceRange(event: React.FormEvent) {
    event.preventDefault();
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  const hasActiveFilters = Boolean(
    currentCategory || currentSizes.length || currentColors.length || minPrice || maxPrice,
  );

  return (
    <div className="flex flex-col gap-8">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            router.push("/products");
            onApply?.();
          }}
          className="flex items-center gap-1.5 self-start font-mono text-xs text-muted-foreground hover:text-clay"
        >
          <X className="size-3.5" /> Clear all filters
        </button>
      )}

      <div>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Category</p>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn(
                "text-sm",
                !currentCategory ? "font-medium text-bottle" : "text-foreground hover:text-bottle",
              )}
            >
              All
            </button>
          </li>
          {facets.categories.map((category) => (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => setCategory(category.slug)}
                className={cn(
                  "text-sm",
                  currentCategory === category.slug
                    ? "font-medium text-bottle"
                    : "text-foreground hover:text-bottle",
                )}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {facets.sizes.length > 0 && (
        <div>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.sizes.map((size) => {
              const active = currentSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleMultiValue("size", size)}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center border px-2 font-mono text-xs",
                    active
                      ? "border-bottle bg-bottle text-paper"
                      : "border-border text-foreground hover:border-bottle",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {facets.colors.length > 0 && (
        <div>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Color</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.colors.map((color) => {
              const active = currentColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleMultiValue("color", color)}
                  className={cn(
                    "border px-3 py-1.5 font-mono text-xs",
                    active
                      ? "border-bottle bg-bottle text-paper"
                      : "border-border text-foreground hover:border-bottle",
                  )}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      <form onSubmit={applyPriceRange}>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Price (Rs)
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-9 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-3 w-full">
          Apply
        </Button>
      </form>
    </div>
  );
}

function ProductFilters({ facets }: { facets: ProductFilterFacets }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setMobileOpen(true)} className="w-full">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="overflow-y-auto p-6">
          <SheetHeader className="border-0 p-0 pb-6">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <FilterContent facets={facets} onApply={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <FilterContent facets={facets} />
      </div>
    </>
  );
}

export { ProductFilters };
