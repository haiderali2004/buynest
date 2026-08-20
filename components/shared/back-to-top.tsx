"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

function BackToTop() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 700);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full bg-bottle text-paper shadow-lg transition-all duration-300 ease-out hover:bg-brass hover:text-ink",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-4.5" />
    </button>
  );
}

export { BackToTop };
