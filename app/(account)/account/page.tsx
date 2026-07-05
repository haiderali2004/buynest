import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // The (account) layout already redirects away if there's no real
  // session, so `claims` is guaranteed here.
  const claims = data!.claims;

  const profile: { fullName: string | null; phone: string | null } | null =
    await prisma.profile.findUnique({
      where: { id: claims.sub },
      select: { fullName: true, phone: true },
    });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl text-foreground">Profile</h2>
      <ProfileForm
        email={claims.email ?? ""}
        fullName={profile?.fullName ?? ""}
        phone={profile?.phone ?? ""}
      />
    </div>
  );
}
