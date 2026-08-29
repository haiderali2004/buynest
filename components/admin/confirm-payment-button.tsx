"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfirmPaymentButtonProps {
  orderId: string;
  paymentMethod: string;
}

function ConfirmPaymentButton({ orderId, paymentMethod }: ConfirmPaymentButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      paymentMethod === "cod"
        ? "Mark this order paid — cash has been collected on delivery?"
        : "Mark this order paid — you've verified the payment screenshot against your account?",
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Couldn't confirm payment.");
        return;
      }

      toast.success("Payment confirmed.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={submitting} className="w-full">
      {submitting ? "Confirming…" : "Mark payment as received"}
    </Button>
  );
}

export { ConfirmPaymentButton };
