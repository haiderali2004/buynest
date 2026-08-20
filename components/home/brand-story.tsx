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

        <Reveal className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative border border-paper/25 p-3.5">
            <svg viewBox="0 0 400 500" className="aspect-4/5 w-full" aria-hidden="true">
              <rect width="400" height="500" fill="#1c2a24" />
              <g stroke="#F0ECE3" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                <rect x="60" y="70" width="130" height="170" rx="4" />
                <line x1="85" y1="115" x2="165" y2="115" opacity="0.5" />
                <line x1="85" y1="145" x2="165" y2="145" opacity="0.5" />
                <line x1="85" y1="175" x2="140" y2="175" opacity="0.5" />
                <g transform="translate(240,260)">
                  <rect x="18" y="0" width="24" height="40" />
                  <path d="M 18 40 L -18 150 C -26 168 -12 184 8 184 L 52 184 C 72 184 86 168 78 150 L 42 40 Z" />
                </g>
                <g transform="translate(90,300) rotate(-20)">
                  <rect x="0" y="0" width="14" height="120" />
                  <path d="M 0 120 L 7 144 L 14 120 Z" />
                </g>
                <circle cx="290" cy="120" r="46" />
                <line x1="290" y1="76" x2="290" y2="60" />
              </g>
            </svg>
            <span className="absolute top-2 left-2 size-5 border-t-2 border-l-2 border-brass" />
            <span className="absolute right-2 bottom-2 size-5 border-r-2 border-b-2 border-brass" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { BrandStory };
