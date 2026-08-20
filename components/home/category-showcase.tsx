import Link from "next/link";
import Image from "next/image";
import { Reveal, RevealStagger } from "@/components/shared/reveal";
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

      <RevealStagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((category, index) =>
          category.imageUrl ? (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative block aspect-3/4 overflow-hidden"
            >
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                priority={index < 4}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-display text-lg text-white">{category.name}</p>
                <p className="font-mono text-xs text-white/70">
                  {category.productCount} item{category.productCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ) : (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-3 border border-border bg-paper px-4 py-8 text-center transition-colors hover:border-bottle"
            >
              <div className="relative size-16">
                <Image
                  src={CATEGORY_ICONS[category.slug] ?? DEFAULT_ICON}
                  alt=""
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <div>
                <p className="font-display text-base text-foreground">{category.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {category.productCount} item{category.productCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          )
        )}
      </RevealStagger>
    </section>
  );
}

export { CategoryShowcase };
