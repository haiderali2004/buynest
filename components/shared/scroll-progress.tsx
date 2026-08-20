"use client";

import * as React from "react";

function ScrollProgress() {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    let ticking = false;

    function update() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setWidth(Math.min(scrolled, 100));
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-[3px] bg-brass transition-[width] duration-100 ease-linear"
      style={{ width: `${width}%` }}
    />
  );
}

export { ScrollProgress };
