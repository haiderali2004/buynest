"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/cart/order-summary";
import { AddressFields, emptyAddress, type AddressFormValue } from "@/components/checkout/address-fields";
import { SavedAddressPicker } from "@/components/checkout/saved-address-picker";
import { cn } from "@/lib/utils";
import type { AccountAddress } from "@/lib/account/addresses";

type PaymentMethod = "cod" | "manual_wallet" | "card";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; helper: string }> = [
  { value: "cod", label: "Cash on Delivery", helper: "Pay in cash when your order arrives." },
  {
    value: "manual_wallet",
    label: "Pay via JazzCash / EasyPaisa",
    helper: "Send payment to our account and upload a screenshot as proof.",
  },
  {
    value: "card",
    label: "Pay via Debit/Credit Card",
    helper: "You'll enter your card details on Safepay's secure payment page.",
  },
];

function savedAddressToFormValue(address: AccountAddress): AddressFormValue {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

interface CheckoutFormProps {
  savedAddresses?: AccountAddress[];
  defaultEmail?: string;
}

function CheckoutForm({ savedAddresses = [], defaultEmail = "" }: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);

  const defaultSavedAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];

  const [email, setEmail] = React.useState(defaultEmail);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | "new">(
    () => defaultSavedAddress?.id ?? "new",
  );
  const [shipping, setShipping] = React.useState<AddressFormValue>(() =>
    defaultSavedAddress ? savedAddressToFormValue(defaultSavedAddress) : emptyAddress,
  );
  const [billingSameAsShipping, setBillingSameAsShipping] = React.useState(true);
  const [billing, setBilling] = React.useState<AddressFormValue>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSelectAddress(id: string | "new") {
    setSelectedAddressId(id);
    if (id === "new") {
      setShipping(emptyAddress);
      return;
    }
    const found = savedAddresses.find((address) => address.id === id);
    if (found) setShipping(savedAddressToFormValue(found));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
          shippingAddress: shipping,
          billingSameAsShipping,
          billingAddress: billingSameAsShipping ? undefined : billing,
          discountCode: discount?.code,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Please check your details.");
        setSubmitting(false);
        return;
      }

      // checkoutUrl points somewhere different per payment method: Safepay's
      // hosted page for card (card details never touch this app), our own
      // wallet-payment page for manual_wallet, or a plain confirmation page
      // for COD — the server decides which, this just follows it.
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-display text-xl text-foreground">Your cart is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add something to your cart before checking out.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <section>
              <h2 className="font-display text-xl text-foreground">Contact</h2>
              <div className="mt-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground">Shipping address</h2>

              {savedAddresses.length > 0 && (
                <div className="mt-4">
                  <SavedAddressPicker
                    addresses={savedAddresses}
                    selectedId={selectedAddressId}
                    onSelect={handleSelectAddress}
                  />
                </div>
              )}

              {(savedAddresses.length === 0 || selectedAddressId === "new") && (
                <AddressFields value={shipping} onChange={setShipping} idPrefix="shipping" />
              )}
            </section>

            <section>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                  className="size-4 accent-bottle"
                />
                Billing address same as shipping
              </label>

              {!billingSameAsShipping && (
                <div className="mt-6">
                  <h2 className="font-display text-xl text-foreground">Billing address</h2>
                  <AddressFields value={billing} onChange={setBilling} idPrefix="billing" />
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground">Payment method</h2>
              <div className="mt-4 flex flex-col gap-2.5">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border px-4 py-3 transition-colors",
                      paymentMethod === method.value
                        ? "border-bottle bg-secondary"
                        : "border-border hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="mt-1 size-4 accent-bottle"
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {method.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {method.helper}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {error && <p className="text-sm text-clay">{error}</p>}

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Placing your order…" : "Continue to payment"}
            </Button>
          </form>
        </div>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

export { CheckoutForm };
