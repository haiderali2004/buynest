import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function Hero() {
  return (
    <section id="hero" className="relative -mt-16 min-h-[88vh] w-full overflow-hidden">
      {/* Hero background — fill + object-cover scales to any viewport without distortion */}
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
          over any photo, fades out toward the right */}
      <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-black/5" />

      {/* Text block — vertically centred, anchored to the left */}
      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-14">
        <div className="max-w-xs sm:max-w-sm">
          <h1 className="font-display text-5xl font-light italic leading-[1.1] text-white sm:text-6xl lg:text-7xl">
            Style,<br />Redefined
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Uncomplicated, essential pieces<br />
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
      </div>

    </section>
  );
}

export { Hero };
