"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function ProductImage({ src, alt, className, sizes, priority }: ProductImageProps) {
  const [loaded, setLoaded] = React.useState(false);

  // Reset the fade-in when the image source changes. Adjusting state during
  // render (instead of in an effect) avoids an extra commit + repaint — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevSrc, setPrevSrc] = React.useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        className={cn("transition-opacity duration-700 ease-in-out", loaded ? "opacity-100" : "opacity-0", className)}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out",
          loaded ? "opacity-0" : "opacity-100",
        )}
      >
        <Image src="/logo-mark.png" alt="" width={86} height={47} className="h-7.2 w-auto animate-breathe" />
      </div>
    </>
  );
}

export { ProductImage };
