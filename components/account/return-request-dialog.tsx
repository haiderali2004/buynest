"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import type { ReturnableOrderItem } from "@/lib/account/returns";

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  items: ReturnableOrderItem[];
}

function ReturnRequestDialog({ open, onOpenChange, orderId, items }: ReturnRequestDialogProps) {
  const router = useRouter();
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [reason, setReason] = React.useState("");
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function setQuantity(orderItemId: string, value: number, max: number) {
    setQuantities((current) => ({ ...current, [orderItemId]: Math.max(0, Math.min(value, max)) }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const selected = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }));

    if (selected.length === 0) {
      setError("Select at least one item to return.");
      return;
    }
    if (!reason.trim()) {
      setError("Please tell us why you're returning this.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/account/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason, customerNote: note || undefined, items: selected }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't submit your return request.");
        return;
      }

      toast.success("Return request submitted.");
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a return</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const quantity = quantities[item.orderItemId] ?? 0;
              return (
                <div
                  key={item.orderItemId}
                  className="flex items-center justify-between gap-3 border border-border p-3"
                >
                  <div>
                    <p className="text-sm text-foreground">{item.productName}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.size} / {item.color} · {formatPrice(item.unitPrice)} ·{" "}
                      {item.returnableQuantity} eligible
                    </p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={item.returnableQuantity}
                    value={quantity}
                    disabled={item.returnableQuantity === 0}
                    onChange={(event) =>
                      setQuantity(item.orderItemId, Number(event.target.value), item.returnableQuantity)
                    }
                    className="h-9 w-16 border border-input bg-paper px-2 text-center text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  />
                </div>
              );
            })}
          </div>

          <div>
            <Label htmlFor="return-reason">Reason</Label>
            <Textarea
              id="return-reason"
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1.5"
              placeholder="e.g. Wrong size, changed my mind, item arrived damaged…"
            />
          </div>

          <div>
            <Label htmlFor="return-note">Anything else? (optional)</Label>
            <Textarea
              id="return-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-1.5"
            />
          </div>

          {error && <p className="text-sm text-clay">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit return request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ReturnRequestDialog };
