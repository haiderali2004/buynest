"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFormDialog } from "@/components/account/address-form-dialog";
import type { AccountAddress } from "@/lib/account/addresses";

function AddressList({ addresses }: { addresses: AccountAddress[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<AccountAddress | undefined>(
    undefined,
  );
  const [busyId, setBusyId] = React.useState<string | null>(null);

  function openCreate() {
    setEditingAddress(undefined);
    setDialogOpen(true);
  }

  function openEdit(address: AccountAddress) {
    setEditingAddress(address);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Couldn't delete this address.");
        return;
      }

      toast.success("Address removed.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/account/addresses/${id}/default`, { method: "PATCH" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Couldn't update default address.");
        return;
      }

      toast.success("Default address updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button onClick={openCreate} className="self-start">
        Add address
      </Button>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven&rsquo;t saved any addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col gap-3 border border-border bg-paper p-4"
            >
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {address.label || "Address"}
                  {address.isDefault && (
                    <span className="font-mono text-[10px] tracking-wide text-bottle uppercase">
                      Default
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-foreground">{address.fullName}</p>
              </div>

              <p className="text-sm text-muted-foreground">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </p>
              <p className="font-mono text-xs text-muted-foreground">{address.phone}</p>

              <div className="mt-1 flex items-center gap-4 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  className="flex items-center gap-1.5 text-xs text-foreground hover:text-bottle"
                >
                  <Pencil className="size-3.5" /> Edit
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    disabled={busyId === address.id}
                    onClick={() => handleSetDefault(address.id)}
                    className="flex items-center gap-1.5 text-xs text-foreground hover:text-bottle disabled:opacity-50"
                  >
                    <Star className="size-3.5" /> Set default
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === address.id}
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-clay disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormDialog open={dialogOpen} onOpenChange={setDialogOpen} address={editingAddress} />
    </div>
  );
}

export { AddressList };
