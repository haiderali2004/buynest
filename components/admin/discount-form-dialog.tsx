"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AdminDiscountListItem } from "@/lib/admin/discounts";

interface DiscountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: AdminDiscountListItem;
}

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage" as "percentage" | "fixed_amount",
  value: "",
  minPurchaseAmount: "0",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

type FormState = typeof emptyForm;

function toFormState(discount?: AdminDiscountListItem): FormState {
  if (!discount) return emptyForm;
  return {
    code: discount.code,
    description: discount.description ?? "",
    discountType: discount.discountType as "percentage" | "fixed_amount",
    value: String(discount.value),
    minPurchaseAmount: String(discount.minPurchaseAmount),
    maxUses: discount.maxUses !== null ? String(discount.maxUses) : "",
    expiresAt: discount.expiresAt ? discount.expiresAt.toISOString().slice(0, 10) : "",
    isActive: discount.isActive,
  };
}

function DiscountFormFields({
  discount,
  onSaved,
}: {
  discount?: AdminDiscountListItem;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => toFormState(discount));
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      value: Number(form.value),
      minPurchaseAmount: Number(form.minPurchaseAmount) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
      isActive: form.isActive,
    };

    try {
      const url = discount ? `/api/admin/discounts/${discount.id}` : "/api/admin/discounts";
      const method = discount ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't save this discount.");
        return;
      }

      toast.success(discount ? "Discount updated." : "Discount created.");
      onSaved();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="disc-code">Code</Label>
        <Input
          id="disc-code"
          required
          value={form.code}
          onChange={(event) => set("code", event.target.value)}
          className="mt-1.5 font-mono uppercase"
        />
      </div>
      <div>
        <Label htmlFor="disc-description">Description</Label>
        <Input
          id="disc-description"
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="disc-type">Type</Label>
          <select
            id="disc-type"
            value={form.discountType}
            onChange={(event) =>
              set("discountType", event.target.value as "percentage" | "fixed_amount")
            }
            className="mt-1.5 h-11 w-full border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed amount (Rs)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="disc-value">
            Value {form.discountType === "percentage" ? "(%)" : "(Rs)"}
          </Label>
          <Input
            id="disc-value"
            type="number"
            min={0}
            step="0.01"
            required
            value={form.value}
            onChange={(event) => set("value", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="disc-min">Minimum order (Rs)</Label>
          <Input
            id="disc-min"
            type="number"
            min={0}
            step="0.01"
            value={form.minPurchaseAmount}
            onChange={(event) => set("minPurchaseAmount", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="disc-max-uses">Max uses (optional)</Label>
          <Input
            id="disc-max-uses"
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(event) => set("maxUses", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="disc-expires">Expires (optional)</Label>
        <Input
          id="disc-expires"
          type="date"
          value={form.expiresAt}
          onChange={(event) => set("expiresAt", event.target.value)}
          className="mt-1.5"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
          className="size-4 accent-bottle"
        />
        Active
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Saving…" : discount ? "Save changes" : "Create discount"}
      </Button>
    </form>
  );
}

function DiscountFormDialog({ open, onOpenChange, discount }: DiscountFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{discount ? "Edit discount" : "Add discount"}</DialogTitle>
        </DialogHeader>
        <DiscountFormFields
          key={discount?.id ?? "new"}
          discount={discount}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { DiscountFormDialog };
