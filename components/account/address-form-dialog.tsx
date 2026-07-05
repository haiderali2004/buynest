"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AccountAddress } from "@/lib/account/addresses";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AccountAddress;
}

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

type FormState = typeof emptyForm;

function toFormState(address?: AccountAddress): FormState {
  if (!address) return emptyForm;
  return {
    label: address.label ?? "",
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}

/**
 * Owns the actual form state. Mounted with a `key` tied to which address
 * is being edited (see below), so switching between "add new" and editing
 * a different address gets fresh initial state for free, on mount —
 * rather than needing an effect to reset state when the `address` prop
 * changes.
 */
function AddressFormFields({
  address,
  onSaved,
}: {
  address?: AccountAddress;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => toFormState(address));
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = address ? `/api/account/addresses/${address.id}` : "/api/account/addresses";
      const method = address ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't save this address.");
        return;
      }

      toast.success(address ? "Address updated." : "Address added.");
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
        <Label htmlFor="dlg-label">Label (e.g. Home, Work)</Label>
        <Input
          id="dlg-label"
          value={form.label}
          onChange={(event) => set("label", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="dlg-fullName">Full name</Label>
          <Input
            id="dlg-fullName"
            required
            value={form.fullName}
            onChange={(event) => set("fullName", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="dlg-phone">Phone</Label>
          <Input
            id="dlg-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(event) => set("phone", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="dlg-line1">Address line 1</Label>
          <Input
            id="dlg-line1"
            required
            value={form.addressLine1}
            onChange={(event) => set("addressLine1", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="dlg-line2">Address line 2 (optional)</Label>
          <Input
            id="dlg-line2"
            value={form.addressLine2}
            onChange={(event) => set("addressLine2", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dlg-city">City</Label>
          <Input
            id="dlg-city"
            required
            value={form.city}
            onChange={(event) => set("city", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dlg-state">State</Label>
          <Input
            id="dlg-state"
            required
            value={form.state}
            onChange={(event) => set("state", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dlg-postal">Postal code</Label>
          <Input
            id="dlg-postal"
            required
            value={form.postalCode}
            onChange={(event) => set("postalCode", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="dlg-country">Country</Label>
          <Input
            id="dlg-country"
            required
            value={form.country}
            onChange={(event) => set("country", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) => set("isDefault", event.target.checked)}
          className="size-4 accent-bottle"
        />
        Set as default address
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Saving…" : address ? "Save changes" : "Add address"}
      </Button>
    </form>
  );
}

function AddressFormDialog({ open, onOpenChange, address }: AddressFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add address"}</DialogTitle>
        </DialogHeader>

        <AddressFormFields
          key={address?.id ?? "new"}
          address={address}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { AddressFormDialog };
