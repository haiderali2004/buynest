import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { SpotlightProduct } from "@/lib/products/queries";

function Spotlight({ products }: { products: SpotlightProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-[#f0ece3] bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:34px_34px] py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal
          as="div"
          className="relative border border-line-strong bg-paper px-6 pt-10 pb-10 shadow-[0_26px_55px_-18px_rgba(28,27,23,.34)] sm:px-10 sm:pb-12"
        >
          {/* spiral-binding rings */}
          <div className="absolute inset-x-0 -top-3 flex justify-evenly px-[6%]">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="size-5 rounded-full border-[3px] border-brass bg-canvas shadow-[inset_0_2px_3px_rgba(0,0,0,.25)]"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="font-mono text-xs tracking-wider text-brass uppercase">
              Two New Arrivals, Catalogued
            </p>
            <h2 className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
              Straight off the truck
            </h2>
          </div>

          <div className="relative mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-dashed sm:divide-line-strong">
            {products.slice(0, 2).map((product, index) => (
              <div key={product.id} className="flex flex-col px-0 sm:px-8">
                <div className="mb-3 flex items-center justify-between font-mono text-xs text-brass">
                  <span>No. {String(index + 1).padStart(3, "0")}</span>
                  <span>Catalogue 2026</span>
                </div>

                <div className="relative mb-5 aspect-16/11 overflow-hidden border border-border bg-canvas">
                  {product.image && (
                    <Image src={product.image} alt={product.name} fill className="object-contain p-6" />
                  )}
                </div>

                <span className="mb-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {product.categoryName ?? "BuyNest"}
                </span>
                <h3 className="font-display text-xl text-foreground sm:text-2xl">{product.name}</h3>

                <dl className="mt-4 mb-5">
                  {product.material && (
                    <div className="flex justify-between gap-4 border-b border-dashed border-line-strong py-2 font-mono text-sm">
                      <dt className="text-xs tracking-wide text-muted-foreground uppercase">Material</dt>
                      <dd className="text-right font-medium text-foreground">{product.material}</dd>
                    </div>
                  )}
                  {product.careInstructions && (
                    <div className="flex justify-between gap-4 border-b border-dashed border-line-strong py-2 font-mono text-sm">
                      <dt className="text-xs tracking-wide text-muted-foreground uppercase">Care</dt>
                      <dd className="text-right font-medium text-foreground">
                        {product.careInstructions}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-auto flex items-center justify-between gap-4">
                  <span className="font-sans text-xl font-extrabold text-foreground">
                    {formatPrice(product.basePrice)}
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/products/${product.slug}`}>View Product</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { Spotlight };
