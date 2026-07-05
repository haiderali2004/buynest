import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAccountAddresses } from "@/lib/account/addresses";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // Saved addresses only make sense for a real (non-anonymous) account —
  // a guest checkout session has nothing saved yet.
  const savedAddresses =
    claims && !claims.is_anonymous ? await getAccountAddresses(claims.sub) : [];

  return (
    <CheckoutForm
      savedAddresses={savedAddresses}
      defaultEmail={!claims?.is_anonymous ? claims?.email ?? "" : ""}
    />
  );
}
