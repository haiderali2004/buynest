import Link from "next/link";
import Image from "next/image";
import { Reveal, RevealStagger } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";
import type { CategoryWithCount } from "@/lib/products/queries";

const CATEGORY_ICONS: Record<string, string> = {
  "notebooks-paper": "/products/notebook.svg",
  "pens-writing": "/products/pen.svg",
  "art-craft": "/products/art.svg",
  "science-lab-kits": "/products/flask.svg",
  "geometry-math": "/products/compass.svg",
  "educational-models": "/products/globe.svg",
};

const DEFAULT_ICON = "/products/notebook.svg";

const ROTATIONS = ["-rotate-2", "rotate-2", "-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];

function CategoryShowcase({ categories }: { categories: CategoryWithCount[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-foreground">Shop by Category</h2>
        <Link
          href="/products"
          className="font-mono text-xs text-muted-foreground hover:text-bottle"
        >
          View all →
        </Link>
      </Reveal>

      <RevealStagger className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className={cn(
              "group relative block border border-line-strong bg-paper p-2.5 pb-4 shadow-[0_14px_30px_-14px_rgba(28,27,23,.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(28,27,23,.4)]",
              ROTATIONS[index % ROTATIONS.length],
            )}
          >
            <span className="absolute -top-1.5 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full bg-brass shadow" />

            <span className="relative block aspect-square w-full overflow-hidden bg-canvas">
              <Image
                src={category.imageUrl ?? CATEGORY_ICONS[category.slug] ?? DEFAULT_ICON}
                alt=""
                fill
                priority={index < 6}
                className={cn(
                  "transition-transform duration-500 group-hover:scale-105",
                  category.imageUrl ? "object-cover" : "object-contain p-6",
                )}
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              />
            </span>

            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] tracking-wider text-brass uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-0.5 font-display text-base leading-tight text-foreground">
                  {category.name}
                </p>
              </div>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {category.productCount} item{category.productCount === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </RevealStagger>
    </section>
  );
}

export { CategoryShowcase };
