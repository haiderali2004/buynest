"use client";

import { cn } from "@/lib/utils";
import type { AccountAddress } from "@/lib/account/addresses";

interface SavedAddressPickerProps {
  addresses: AccountAddress[];
  selectedId: string | "new";
  onSelect: (id: string | "new") => void;
}

function SavedAddressPicker({ addresses, selectedId, onSelect }: SavedAddressPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {addresses.map((address) => (
        <button
          key={address.id}
          type="button"
          onClick={() => onSelect(address.id)}
          className={cn(
            "border p-4 text-left text-sm transition-colors",
            selectedId === address.id
              ? "border-bottle bg-secondary"
              : "border-border hover:border-bottle",
          )}
        >
          <p className="font-medium text-foreground">
            {address.label || "Address"}
            {address.isDefault && (
              <span className="ml-2 font-mono text-[10px] tracking-wide text-bottle uppercase">
                Default
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {address.fullName} · {address.addressLine1}, {address.city}, {address.state}{" "}
            {address.postalCode}
          </p>
        </button>
      ))}

      <button
        type="button"
        onClick={() => onSelect("new")}
        className={cn(
          "border p-4 text-left text-sm transition-colors",
          selectedId === "new" ? "border-bottle bg-secondary" : "border-border hover:border-bottle",
        )}
      >
        <p className="font-medium text-foreground">+ Use a new address</p>
      </button>
    </div>
  );
}

export { SavedAddressPicker };
