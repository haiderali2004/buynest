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

function Departments({ categories }: { categories: CategoryWithCount[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs tracking-wider text-brass uppercase">Departments</p>
          <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Shop by department
          </h2>
        </div>
        <Link
          href="/products"
          className="font-mono text-xs text-muted-foreground hover:text-bottle"
        >
          View all categories →
        </Link>
      </Reveal>

      <RevealStagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3" as="div">
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group relative block aspect-3/4 overflow-hidden border border-border"
          >
            <Image
              src={category.imageUrl ?? CATEGORY_ICONS[category.slug] ?? DEFAULT_ICON}
              alt=""
              fill
              priority={index < 3}
              className={
                category.imageUrl
                  ? "object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  : "object-contain bg-canvas p-16 transition-transform duration-700 ease-out group-hover:scale-105"
              }
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#152720]/90 via-[#152720]/25 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 z-10">
              <span className="font-mono text-[11px] tracking-wider text-brass uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-display text-xl text-white">{category.name}</h3>
              {category.description ? (
                <p className="mt-1.5 max-w-[26ch] text-sm text-white/80">{category.description}</p>
              ) : (
                <p className="mt-1.5 font-mono text-xs text-white/70">
                  {category.productCount} item{category.productCount === 1 ? "" : "s"}
                </p>
              )}
              <span className="mt-3 inline-flex items-center gap-1.5 border-b border-brass pb-0.5 font-mono text-xs font-medium text-white">
                Shop {category.name.split(" ")[0]} →
              </span>
            </div>
          </Link>
        ))}
      </RevealStagger>
    </section>
  );
}

export { Departments };
