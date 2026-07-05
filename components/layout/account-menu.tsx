"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import type { NavUser } from "@/types";

function AccountMenu({ user, transparent = false }: { user: NavUser | null; transparent?: boolean }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);

    if (error) {
      toast.error("Couldn't sign out. Please try again.");
      return;
    }

    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex size-10 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          transparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary",
        )}
        aria-label="Account menu"
      >
        {user ? (
          <span className="flex size-7 items-center justify-center rounded-full bg-bottle font-mono text-[11px] font-semibold text-paper">
            {getInitials(user.fullName ?? user.email)}
          </span>
        ) : (
          <User className="size-5" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {user ? (
          <>
            <DropdownMenuLabel>{user.fullName ?? user.email ?? "My account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">My account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/orders">Order history</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/addresses">Addresses</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={signingOut} onClick={handleSignOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Welcome to BuyNest</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Sign in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register">Create an account</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AccountMenu };
