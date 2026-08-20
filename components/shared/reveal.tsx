"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}

/** Fades and lifts children into place once they cross into the viewport. */
function Reveal({ children, className, as = "div" }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Like Reveal, but staggers direct children in on a short cascade. */
function RevealStagger({ children, className, as = "div" }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  const items = React.Children.toArray(children);

  return (
    <Tag ref={ref as never} className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-700 ease-out",
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          )}
          style={{ transitionDelay: visible ? `${index * 90}ms` : "0ms" }}
        >
          {child}
        </div>
      ))}
    </Tag>
  );
}

export { Reveal, RevealStagger };
