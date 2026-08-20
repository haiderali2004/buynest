"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/products/queries";

interface HeroProps {
  pinnedProducts?: ProductCardData[];
}

const CARD_STYLES = [
  "top-0 left-0 z-[3] -rotate-6 animate-[bob_6.5s_ease-in-out_infinite]",
  "top-[28%] right-0 z-[2] rotate-4 animate-[bob_7.5s_ease-in-out_infinite_-2s]",
  "bottom-0 left-[18%] z-[1] -rotate-3 animate-[bob_8.2s_ease-in-out_infinite_-4s]",
];

function Hero({ pinnedProducts = [] }: HeroProps) {
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="hero" className="relative -mt-16 min-h-[88vh] w-full overflow-hidden">
      {/* Hero background — an illustrated desk scene rendered as inline SVG so it
          scales losslessly to any viewport without shipping a raster asset */}
      <div className="absolute inset-0 bg-[#2c2318]" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c2318" />
            <stop offset="55%" stopColor="#24332c" />
            <stop offset="100%" stopColor="#1c2a24" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#hero-bg)" />

        <g opacity="0.5" stroke="#F0ECE3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* notebook */}
          <g transform="translate(980,120) rotate(-8)">
            <rect x="0" y="0" width="150" height="200" rx="6" />
            <rect x="0" y="0" width="18" height="200" fill="#24433A" fillOpacity="0.6" />
            <line x1="45" y1="55" x2="130" y2="55" opacity="0.6" />
            <line x1="45" y1="90" x2="130" y2="90" opacity="0.6" />
            <line x1="45" y1="125" x2="105" y2="125" opacity="0.6" />
          </g>

          {/* fountain pen */}
          <g transform="translate(1230,300) rotate(35)">
            <rect x="0" y="0" width="26" height="220" rx="8" />
            <rect x="0" y="60" width="26" height="10" fill="#B8893E" fillOpacity="0.7" stroke="none" />
            <path d="M 0 220 L 13 260 L 26 220 Z" fill="#F0ECE3" fillOpacity="0.2" />
          </g>

          {/* flask */}
          <g transform="translate(1150,520)">
            <rect x="24" y="0" width="34" height="60" />
            <path d="M 24 60 L -30 190 C -40 212 -22 232 4 232 L 78 232 C 104 232 122 212 112 190 L 58 60 Z" />
            <path d="M -14 150 C 20 138 60 138 96 150 L 112 190 C 122 212 104 232 78 232 L 4 232 C -22 232 -40 212 -30 190 Z" fill="#24433A" fillOpacity="0.55" stroke="none" />
          </g>

          {/* compass */}
          <g transform="translate(140,560)">
            <circle cx="0" cy="-70" r="14" />
            <line x1="0" y1="-56" x2="-60" y2="180" />
            <line x1="0" y1="-56" x2="60" y2="140" />
          </g>

          {/* globe */}
          <g transform="translate(310,140)">
            <circle cx="0" cy="0" r="70" />
            <ellipse cx="0" cy="0" rx="70" ry="24" opacity="0.6" />
            <ellipse cx="0" cy="0" rx="30" ry="70" opacity="0.6" />
            <line x1="0" y1="72" x2="0" y2="112" />
            <path d="M -40 112 L 40 112 L 26 140 L -26 140 Z" />
          </g>

          {/* pencil */}
          <g transform="translate(60,260) rotate(-25)">
            <rect x="0" y="0" width="18" height="150" />
            <path d="M 0 150 L 9 180 L 18 150 Z" />
          </g>
        </g>
      </svg>

      {/* Gradient — darkens the left side so white text stays legible
          over the illustration, fades out toward the right */}
      <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-black/5" />

      <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-8 px-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
        {/* Text block */}
        <div className="max-w-xs sm:max-w-sm">
          <h1 className="font-display text-5xl font-light italic leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden">
              <span
                className={cn(
                  "block transition-transform duration-700 ease-out",
                  revealed ? "translate-y-0" : "translate-y-full",
                )}
              >
                Curiosity,
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className={cn(
                  "block transition-transform delay-100 duration-700 ease-out",
                  revealed ? "translate-y-0" : "translate-y-full",
                )}
              >
                Supplied
              </span>
            </span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Notebooks, art supplies, lab kits, and learning tools<br />
            you&rsquo;ll reach for again and again
          </p>
          <div className="mt-8">
            <Button
              asChild
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-ink"
            >
              <Link href="/products">Shop All</Link>
            </Button>
          </div>
        </div>

        {/* Pinned product cards — desktop only, so the mobile hero stays uncluttered */}
        {pinnedProducts.length > 0 && (
          <div className="relative hidden h-[420px] lg:block">
            {pinnedProducts.slice(0, 3).map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={cn(
                  "absolute w-[46%] max-w-52 border border-line-strong bg-paper p-2.5 pb-3 shadow-[0_18px_40px_-16px_rgba(28,27,23,.4)] transition-shadow hover:shadow-[0_26px_55px_-18px_rgba(28,27,23,.5)]",
                  CARD_STYLES[index],
                )}
              >
                <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brass shadow" />
                <span className="relative block aspect-4/3 w-full overflow-hidden bg-canvas">
                  {product.image && (
                    <Image src={product.image} alt="" fill className="object-contain p-2" />
                  )}
                </span>
                <span className="mt-2 flex items-baseline justify-between font-mono text-[11px] text-ink-muted">
                  <span className="truncate pr-2 font-semibold text-ink">{product.name}</span>
                  <span className="shrink-0">{formatPrice(product.basePrice)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { Hero };
