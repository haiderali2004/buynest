"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";

interface GalleryImage {
  id: string;
  url: string;
  altText: string | null;
}

function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-3/4 w-full items-center justify-center bg-secondary font-mono text-xs text-muted-foreground">
        No image
      </div>
    );
  }

  const hasMultiple = images.length > 1;

  function goToPrev() {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }

  function goToNext() {
    setActiveIndex((index) => (index + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-3/4 w-full overflow-hidden bg-secondary">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ width: `${images.length * 100}%`, transform: `translateX(-${activeIndex * (100 / images.length)}%)` }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <ProductImage
                src={image.url}
                alt={image.altText ?? productName}
                className="object-cover"
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          ))}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-foreground opacity-0 shadow-md transition-all duration-300 ease-out group-hover:opacity-100 hover:bg-paper"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next image"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-foreground opacity-0 shadow-md transition-all duration-300 ease-out group-hover:opacity-100 hover:bg-paper"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden border bg-secondary",
                index === activeIndex ? "border-bottle" : "border-transparent",
              )}
            >
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ProductGallery };
