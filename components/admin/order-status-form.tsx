"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORDER_STATUSES } from "@/lib/validations/admin-order";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  currentCarrier?: string | null;
  currentTrackingNumber?: string | null;
  currentTrackingUrl?: string | null;
}

function OrderStatusForm({
  orderId,
  currentStatus,
  currentCarrier,
  currentTrackingNumber,
  currentTrackingUrl,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = React.useState(currentStatus);
  const [note, setNote] = React.useState("");
  const [carrier, setCarrier] = React.useState(currentCarrier ?? "");
  const [trackingNumber, setTrackingNumber] = React.useState(currentTrackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = React.useState(currentTrackingUrl ?? "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note: note || undefined,
          carrier: carrier || undefined,
          trackingNumber: trackingNumber || undefined,
          trackingUrl: trackingUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Couldn't update status.");
        return;
      }

      toast.success("Order status updated.");
      setNote("");
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
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      {(status === "shipped" || status === "delivered") && (
        <div className="flex flex-col gap-2 border border-border p-3">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Shipment details
          </p>
          <div>
            <Label htmlFor="carrier" className="text-xs">
              Carrier
            </Label>
            <Input
              id="carrier"
              placeholder="e.g. TCS, Leopards Courier"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="trackingNumber" className="text-xs">
              Tracking number
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="trackingUrl" className="text-xs">
              Tracking link
            </Label>
            <Input
              id="trackingUrl"
              type="url"
              placeholder="https://…"
              value={trackingUrl}
              onChange={(event) => setTrackingUrl(event.target.value)}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </div>
      )}

      <Textarea
        placeholder="Optional note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Updating…" : "Update status"}
      </Button>
    </form>
  );
}

export { OrderStatusForm };
