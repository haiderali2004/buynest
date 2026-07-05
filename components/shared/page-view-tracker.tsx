"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a fire-and-forget page-view beacon on every route change. This is
 * a genuine side effect (talking to an external endpoint in response to
 * navigation), not state synchronization — a normal, idiomatic useEffect
 * use case, unlike the "derive state from a prop" pattern this codebase
 * otherwise avoids.
 */
function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Admin staff browsing their own dashboard aren't "visitors" in the
    // sense this is meant to measure.
    if (pathname.startsWith("/admin")) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      }),
    }).catch(() => {
      // Telemetry failing silently is correct here — never disrupt the visitor.
    });
  }, [pathname]);

  return null;
}

export { PageViewTracker };
