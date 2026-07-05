import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAccountAddresses } from "@/lib/account/addresses";
import { AddressList } from "@/components/account/address-list";

export const metadata: Metadata = {
  title: "Addresses",
};

export default async function AccountAddressesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data!.claims;

  const addresses = await getAccountAddresses(claims.sub);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl text-foreground">Addresses</h2>
      <AddressList addresses={addresses} />
    </div>
  );
}
