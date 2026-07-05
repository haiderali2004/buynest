"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RETURN_STATUSES } from "@/lib/validations/returns";

interface ReturnStatusFormProps {
  returnId: string;
  currentStatus: string;
  suggestedRefundAmount: number;
  hasPayment: boolean;
}

function ReturnStatusForm({
  returnId,
  currentStatus,
  suggestedRefundAmount,
  hasPayment,
}: ReturnStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState(currentStatus);
  const [adminNote, setAdminNote] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState(String(suggestedRefundAmount));
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: adminNote || undefined,
          refundAmount: status === "refunded" ? Number(refundAmount) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Couldn't update this return.");
        return;
      }

      toast.success("Return updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="h-11 border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {RETURN_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value.replace("_", " ")}
          </option>
        ))}
      </select>

      {status === "refunded" && (
        <div>
          <Label htmlFor="refundAmount">Refund amount (Rs)</Label>
          <Input
            id="refundAmount"
            type="number"
            min={0}
            step="0.01"
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
            className="mt-1.5"
            disabled={!hasPayment}
          />
          {!hasPayment && (
            <p className="mt-1 text-xs text-clay">
              This order has no payment on record — a refund can&rsquo;t be processed.
            </p>
          )}
        </div>
      )}

      <Textarea
        placeholder="Internal note (visible to admins only)"
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
      />

      <Button type="submit" disabled={submitting || (status === "refunded" && !hasPayment)}>
        {submitting ? "Updating…" : "Update return"}
      </Button>
    </form>
  );
}

export { ReturnStatusForm };
