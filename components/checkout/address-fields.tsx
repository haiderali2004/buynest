"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AddressFormValue {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const emptyAddress: AddressFormValue = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

interface AddressFieldsProps {
  value: AddressFormValue;
  onChange: (value: AddressFormValue) => void;
  idPrefix: string;
}

function AddressFields({ value, onChange, idPrefix }: AddressFieldsProps) {
  function set<K extends keyof AddressFormValue>(key: K, fieldValue: AddressFormValue[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-fullName`}>Full name</Label>
        <Input
          id={`${idPrefix}-fullName`}
          required
          autoComplete="name"
          value={value.fullName}
          onChange={(event) => set("fullName", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          required
          autoComplete="tel"
          value={value.phone}
          onChange={(event) => set("phone", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-line1`}>Address line 1</Label>
        <Input
          id={`${idPrefix}-line1`}
          required
          autoComplete="address-line1"
          value={value.addressLine1}
          onChange={(event) => set("addressLine1", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-line2`}>Address line 2 (optional)</Label>
        <Input
          id={`${idPrefix}-line2`}
          autoComplete="address-line2"
          value={value.addressLine2}
          onChange={(event) => set("addressLine2", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-city`}>City</Label>
        <Input
          id={`${idPrefix}-city`}
          required
          autoComplete="address-level2"
          value={value.city}
          onChange={(event) => set("city", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-state`}>State</Label>
        <Input
          id={`${idPrefix}-state`}
          required
          autoComplete="address-level1"
          value={value.state}
          onChange={(event) => set("state", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-postalCode`}>Postal code</Label>
        <Input
          id={`${idPrefix}-postalCode`}
          required
          autoComplete="postal-code"
          value={value.postalCode}
          onChange={(event) => set("postalCode", event.target.value)}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-country`}>Country</Label>
        <Input
          id={`${idPrefix}-country`}
          required
          autoComplete="country-name"
          value={value.country}
          onChange={(event) => set("country", event.target.value)}
          className="mt-1.5"
        />
      </div>
    </div>
  );
}

export { AddressFields };
