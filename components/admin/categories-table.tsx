"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import type { AdminCategoryListItem, CategoryParentOption } from "@/lib/admin/categories";

function CategoriesTable({
  categories,
  parentOptions,
}: {
  categories: AdminCategoryListItem[];
  parentOptions: CategoryParentOption[];
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<AdminCategoryListItem | undefined>(
    undefined,
  );

  function openCreate() {
    setEditingCategory(undefined);
    setDialogOpen(true);
  }

  function openEdit(category: AdminCategoryListItem) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} total</p>
        </div>
        <Button onClick={openCreate}>Add category</Button>
      </div>

      <div className="border border-border bg-paper">
        {categories.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Parent</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <p className="text-foreground">{category.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{category.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {category.parentName ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">{category.productCount}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">
                      {category.displayOrder}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
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

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentOptions={parentOptions}
      />
    </div>
  );
}

export { CategoriesTable };
