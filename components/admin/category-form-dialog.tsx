"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { AdminCategoryListItem, CategoryParentOption } from "@/lib/admin/categories";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategoryListItem;
  parentOptions: CategoryParentOption[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  parentId: "",
  displayOrder: "0",
  isActive: true,
};

type FormState = typeof emptyForm;

function toFormState(category?: AdminCategoryListItem): FormState {
  if (!category) return emptyForm;
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    imageUrl: category.imageUrl ?? "",
    parentId: category.parentId ?? "",
    displayOrder: String(category.displayOrder),
    isActive: category.isActive,
  };
}

function CategoryFormFields({
  category,
  parentOptions,
  onSaved,
}: {
  category?: AdminCategoryListItem;
  parentOptions: CategoryParentOption[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(() => toFormState(category));
  const [slugTouched, setSlugTouched] = React.useState(Boolean(category));
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(value: string) {
    set("name", value);
    if (!slugTouched) set("slug", slugify(value));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      parentId: form.parentId || undefined,
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };

    try {
      const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't save this category.");
        return;
      }

      toast.success(category ? "Category updated." : "Category created.");
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
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          required
          value={form.name}
          onChange={(event) => handleNameChange(event.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="cat-slug">Slug</Label>
        <Input
          id="cat-slug"
          required
          value={form.slug}
          onChange={(event) => {
            setSlugTouched(true);
            set("slug", event.target.value);
          }}
          className="mt-1.5 font-mono text-sm"
        />
      </div>
      <div>
        <Label htmlFor="cat-description">Description</Label>
        <Textarea
          id="cat-description"
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
          className="mt-1.5"
        />
      </div>
      <ImageUploadField
        id="cat-image"
        label="Image URL"
        value={form.imageUrl}
        onChange={(url) => set("imageUrl", url)}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cat-parent">Parent category</Label>
          <select
            id="cat-parent"
            value={form.parentId}
            onChange={(event) => set("parentId", event.target.value)}
            className="mt-1.5 h-11 w-full border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="">None (top-level)</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="cat-order">Display order</Label>
          <Input
            id="cat-order"
            type="number"
            value={form.displayOrder}
            onChange={(event) => set("displayOrder", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
          className="size-4 accent-bottle"
        />
        Active (visible in the store)
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Saving…" : category ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}

function CategoryFormDialog({ open, onOpenChange, category, parentOptions }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
        </DialogHeader>
        <CategoryFormFields
          key={category?.id ?? "new"}
          category={category}
          parentOptions={parentOptions}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CategoryFormDialog };
