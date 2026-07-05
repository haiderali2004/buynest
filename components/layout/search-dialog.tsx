"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { NavCategory } from "@/types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: NavCategory[];
}

function SearchDialog({ open, onOpenChange, categories }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onOpenChange(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[8%] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Search BuyNest</DialogTitle>
          <DialogDescription>Find products by name, category, or material.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search for shirts, linen, outerwear…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </form>

        <div className="mt-5">
          <p className="mb-2.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Browse categories
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-bottle hover:text-bottle"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/products"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-bottle hover:text-bottle"
                >
                  All products
                </Link>
                <Link
                  href="/sale"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-bottle hover:text-bottle"
                >
                  Sale
                </Link>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SearchDialog };
