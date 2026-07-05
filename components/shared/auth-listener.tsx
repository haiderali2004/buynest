"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounted once in the root layout. Server Components (the Navbar's user
 * prop, account pages, etc.) only re-render on navigation, so a client-side
 * sign-in or sign-out would otherwise leave them showing stale state until
 * the next manual navigation. This listens for auth changes and forces a
 * server re-render so the rest of the app catches up immediately.
 */
function AuthListener() {
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createClient();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.refresh();
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [router]);

  return null;
}

export { AuthListener };
