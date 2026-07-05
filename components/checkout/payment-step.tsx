"use client";

import * as React from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface PaymentStepProps {
  orderNumber: string;
  total: number;
}

function PaymentStep({ orderNumber, total }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
      },
    });

    // Stripe redirects to `return_url` on success (or for payment methods
    // that complete without a redirect, Next.js navigation would need to
    // happen here too — but `return_url` covers both cases since Stripe
    // only stays on this page to report an error).
    if (confirmError) {
      setError(confirmError.message ?? "We couldn't process that payment. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" size="lg" disabled={!stripe || !elements || submitting}>
        {submitting ? "Processing…" : `Pay ${formatPrice(total)}`}
      </Button>
    </form>
  );
}

export { PaymentStep };
