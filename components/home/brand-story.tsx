import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { StatCounter } from "@/components/home/stat-counter";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { CatalogStats } from "@/lib/products/queries";

function BrandStory({ stats }: { stats: CatalogStats }) {
  const tiles = [
    { target: stats.categoryCount, label: "Departments & categories" },
    { target: stats.productCount, label: "Products catalogued" },
    { target: 30, suffix: "-day", label: "Return window" },
    { target: FREE_SHIPPING_THRESHOLD, prefix: "Rs ", label: "Free shipping threshold" },
  ];

  return (
    <section className="bg-canvas-weave py-16 text-paper sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <p className="font-mono text-xs tracking-wider text-brass uppercase">Why BuyNest</p>
          <h2 className="mt-2 font-display text-2xl text-paper sm:text-3xl">
            We stock for the making, not just the buying.
          </h2>
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-paper/75">
            BuyNest started as a question: why does the school-supply aisle, the hobby shop, and
            the science store all feel like different places? We put them under one roof —
            notebooks next to lab kits next to watercolor pans — so a curious mind never has to
            shop in three tabs.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7">
            {tiles.map((tile) => (
              <div key={tile.label}>
                <b className="block font-display text-3xl font-semibold text-brass sm:text-4xl">
                  <StatCounter target={tile.target} prefix={tile.prefix} suffix={tile.suffix} />
                </b>
                <span className="mt-1.5 block font-mono text-xs tracking-wide text-paper/60 uppercase">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mx-auto w-full max-w-xs lg:max-w-sm">
          <div className="relative border border-paper/25 p-3.5">
            <Image
              src="/brand-story.png"
              alt="A flat-lay of BuyNest products — notebooks, pens, a lab kit, and art supplies"
              width={1122}
              height={1402}
              className="aspect-4/5 w-full object-cover"
            />
            <span className="absolute top-2 left-2 size-5 border-t-2 border-l-2 border-brass" />
            <span className="absolute right-2 bottom-2 size-5 border-r-2 border-b-2 border-brass" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { BrandStory };
