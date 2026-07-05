import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // Anonymous sessions (from guest checkout) are real sessions, but there's
  // no actual account to manage — send them to sign in for a real one.
  if (!claims || claims.is_anonymous) {
    redirect("/login?redirect=/account");
  }

  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName = typeof metadata.full_name === "string" ? metadata.full_name : null;

  const profile: { fullName: string | null } | null = await prisma.profile.findUnique({
    where: { id: claims.sub },
    select: { fullName: true },
  });

  const firstName = (profile?.fullName ?? fallbackName)?.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">
        {firstName ? `Hi, ${firstName}` : "My Account"}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
