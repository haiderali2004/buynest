"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** A brief branded loading flourish shown once per session on first paint. */
function Preloader() {
  const [visible, setVisible] = React.useState(true);
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : 750;

    const hideTimer = setTimeout(() => setVisible(false), delay);
    const removeTimer = setTimeout(() => setGone(true), delay + 500);

    return () => {
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
      <svg viewBox="0 0 40 40" className="size-16 overflow-visible">
        <path
          d="M20 4 L36 16.5 V36 H4 V16.5 Z"
          fill="none"
          stroke="var(--color-bottle)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeDasharray="120"
          className="animate-[draw-house_1.1s_cubic-bezier(.22,.68,.36,1)_forwards]"
        />
        <path
          d="M10.5 25.5 Q20 19.5 29.5 25.5"
          fill="none"
          stroke="var(--color-brass)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="40"
          className="animate-[draw-nest_0.7s_cubic-bezier(.22,.68,.36,1)_0.5s_backwards]"
        />
        <circle
          cx="20"
          cy="22.6"
          r="2.4"
          fill="var(--color-brass)"
          className="animate-[fadein_0.4s_ease_0.9s_backwards]"
        />
      </svg>
    </div>
  );
}

export { Preloader };
