"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** A brief branded loading flourish shown once per session on first paint. */
function Preloader() {
  const [visible, setVisible] = React.useState(true);
  const [gone, setGone] = React.useState(false);
  const [logoIn, setLogoIn] = React.useState(false);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : 750;

    const logoFrame = requestAnimationFrame(() => setLogoIn(true));
    const hideTimer = setTimeout(() => setVisible(false), delay);
    const removeTimer = setTimeout(() => setGone(true), delay + 500);

    return () => {
      cancelAnimationFrame(logoFrame);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-canvas transition-opacity duration-500 ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Image
        src="/logo.png"
        alt=""
        width={137}
        height={75}
        className={cn(
          "h-10 w-auto transition-all duration-500 ease-out",
          logoIn ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      />
    </div>
  );
}

export { Preloader };
