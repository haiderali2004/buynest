"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DiscountFormDialog } from "@/components/admin/discount-form-dialog";
import { formatPrice } from "@/lib/utils";
import type { AdminDiscountListItem } from "@/lib/admin/discounts";

function DiscountsTable({ discounts }: { discounts: AdminDiscountListItem[] }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<AdminDiscountListItem | undefined>(
    undefined,
  );

  function openCreate() {
    setEditingDiscount(undefined);
    setDialogOpen(true);
  }

  function openEdit(discount: AdminDiscountListItem) {
    setEditingDiscount(discount);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Discounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">{discounts.length} total</p>
        </div>
        <Button onClick={openCreate}>Add discount</Button>
      </div>

      <div className="border border-border bg-paper">
        {discounts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No discount codes yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Min order</th>
                  <th className="px-5 py-3">Used</th>
                  <th className="px-5 py-3">Expires</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-mono text-foreground">{discount.code}</p>
                      {discount.description && (
                        <p className="text-xs text-muted-foreground">{discount.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">
                      {discount.discountType === "percentage"
                        ? `${discount.value}%`
                        : formatPrice(discount.value)}
                    </td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">
                      {discount.minPurchaseAmount > 0 ? formatPrice(discount.minPurchaseAmount) : "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">
                      {discount.usedCount}
                      {discount.maxUses ? ` / ${discount.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {discount.expiresAt ? discount.expiresAt.toLocaleDateString("en-PK") : "Never"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={discount.isActive ? "default" : "secondary"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(discount)}
                        className="font-mono text-xs text-bottle hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DiscountFormDialog open={dialogOpen} onOpenChange={setDialogOpen} discount={editingDiscount} />
    </div>
  );
}

export { DiscountsTable };
