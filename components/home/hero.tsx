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
  "top-6 left-0 z-[3] -rotate-6 animate-[bob_6.5s_ease-in-out_infinite]",
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
      {/* Hero background */}
      <div className="absolute inset-0 bg-[#2c2318]" />
      <Image
        src="/hero.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
      />

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
          <div className="relative hidden h-105 lg:block">
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
