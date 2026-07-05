"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { cn } from "@/lib/utils";
import type { AdminCategoryOption, AdminProductDetail } from "@/lib/admin/products";

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  stockQuantity: string;
  priceOverride: string;
}

interface ImageRow {
  url: string;
  isPrimary: boolean;
}

function emptyImageRow(): ImageRow {
  return { url: "", isPrimary: false };
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  categories: AdminCategoryOption[];
  initialValues?: AdminProductDetail;
}

function emptyVariantRow(): VariantRow {
  return { size: "", color: "", colorHex: "", stockQuantity: "0", priceOverride: "" };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProductForm({ mode, productId, categories, initialValues }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = React.useState(initialValues?.name ?? "");
  const [slug, setSlug] = React.useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [description, setDescription] = React.useState(initialValues?.description ?? "");
  const [categoryId, setCategoryId] = React.useState(initialValues?.categoryId ?? "");
  const [material, setMaterial] = React.useState(initialValues?.material ?? "");
  const [careInstructions, setCareInstructions] = React.useState(
    initialValues?.careInstructions ?? "",
  );
  const [basePrice, setBasePrice] = React.useState(
    initialValues ? String(initialValues.basePrice) : "",
  );
  const [compareAtPrice, setCompareAtPrice] = React.useState(
    initialValues?.compareAtPrice !== null && initialValues?.compareAtPrice !== undefined
      ? String(initialValues.compareAtPrice)
      : "",
  );
  const [isActive, setIsActive] = React.useState(initialValues?.isActive ?? true);
  const [images, setImages] = React.useState<ImageRow[]>(
    initialValues?.images.length
      ? initialValues.images.map((image) => ({ url: image.url, isPrimary: image.isPrimary }))
      : [{ url: "", isPrimary: true }],
  );
  const [variants, setVariants] = React.useState<VariantRow[]>(
    initialValues?.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex ?? "",
      stockQuantity: String(variant.stockQuantity),
      priceOverride: variant.priceOverride !== null ? String(variant.priceOverride) : "",
    })) ?? [emptyVariantRow()],
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, emptyVariantRow()]);
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  function updateImageUrl(index: number, url: string) {
    setImages((rows) => rows.map((row, i) => (i === index ? { ...row, url } : row)));
  }

  function setPrimaryImage(index: number) {
    setImages((rows) => rows.map((row, i) => ({ ...row, isPrimary: i === index })));
  }

  function addImage() {
    setImages((rows) => [...rows, emptyImageRow()]);
  }

  function removeImage(index: number) {
    setImages((rows) => {
      const next = rows.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((row) => row.isPrimary)) {
        next[0] = { ...next[0]!, isPrimary: true };
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (variants.length === 0) {
      setError("Add at least one variant.");
      return;
    }

    const filledImages = images.filter((image) => image.url.trim() !== "");
    if (filledImages.length === 0) {
      setError("Add at least one image.");
      return;
    }
    if (!filledImages.some((image) => image.isPrimary)) {
      filledImages[0]!.isPrimary = true;
    }

    const payload = {
      name,
      slug,
      description,
      categoryId: categoryId || undefined,
      material: material || undefined,
      careInstructions: careInstructions || undefined,
      basePrice: Number(basePrice),
      compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : undefined,
      isActive,
      images: filledImages.map((image) => ({ url: image.url.trim(), isPrimary: image.isPrimary })),
      variants: variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex || undefined,
        stockQuantity: Number(variant.stockQuantity) || 0,
        priceOverride: variant.priceOverride.trim() ? Number(variant.priceOverride) : undefined,
      })),
    };

    setSubmitting(true);

    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
        return;
      }

      toast.success(mode === "create" ? "Product created." : "Product saved.");
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className="mt-1.5 font-mono text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-1.5 h-11 w-full border border-input bg-paper px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-bottle"
            />
            Active (visible in the store)
          </label>
        </div>
        <div>
          <Label htmlFor="basePrice">Price (Rs)</Label>
          <Input
            id="basePrice"
            type="number"
            min={0}
            step="0.01"
            required
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare-at price (Rs, optional)</Label>
          <Input
            id="compareAtPrice"
            type="number"
            min={0}
            step="0.01"
            value={compareAtPrice}
            onChange={(event) => setCompareAtPrice(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="care">Care instructions</Label>
          <Input
            id="care"
            value={careInstructions}
            onChange={(event) => setCareInstructions(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Images</Label>
            <Button type="button" variant="outline" size="sm" onClick={addImage}>
              <Plus className="size-4" /> Add image
            </Button>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {images.map((image, index) => (
              <div key={index} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index)}
                  aria-pressed={image.isPrimary}
                  className={cn(
                    "mt-6 flex h-11 shrink-0 items-center gap-1.5 border px-3 font-mono text-[11px] tracking-wide uppercase transition-colors",
                    image.isPrimary
                      ? "border-bottle bg-bottle text-paper"
                      : "border-input bg-paper text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Star className="size-3.5" fill={image.isPrimary ? "currentColor" : "none"} />
                  {image.isPrimary ? "Main" : "Set main"}
                </button>

                <div className="flex-1">
                  <ImageUploadField
                    id={`image-${index}`}
                    label={index === 0 ? "Image URL" : `Image ${index + 1} URL`}
                    value={image.url}
                    onChange={(url) => updateImageUrl(index, url)}
                  />
                </div>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                    className="mt-6 flex h-11 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-clay"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-2 font-mono text-xs text-muted-foreground">
            The main image shows on the shop grid; the rest appear as swipeable gallery photos on
            the product page.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-foreground">Variants</p>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="size-4" /> Add variant
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-3 border border-border bg-paper p-4 sm:grid-cols-5"
            >
              <div>
                <Label className="font-mono text-[11px] uppercase">Size</Label>
                <Input
                  required
                  value={variant.size}
                  onChange={(event) => updateVariant(index, { size: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="font-mono text-[11px] uppercase">Color</Label>
                <Input
                  required
                  value={variant.color}
                  onChange={(event) => updateVariant(index, { color: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="font-mono text-[11px] uppercase">Hex</Label>
                <Input
                  placeholder="#000000"
                  value={variant.colorHex}
                  onChange={(event) => updateVariant(index, { colorHex: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="font-mono text-[11px] uppercase">Stock</Label>
                <Input
                  type="number"
                  min={0}
                  required
                  value={variant.stockQuantity}
                  onChange={(event) => updateVariant(index, { stockQuantity: event.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="font-mono text-[11px] uppercase">Price override</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={variant.priceOverride}
                    onChange={(event) =>
                      updateVariant(index, { priceOverride: event.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                {!variant.id && variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    aria-label="Remove variant"
                    className="flex h-11 w-9 items-center justify-center text-muted-foreground hover:text-clay"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {mode === "edit" && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Existing variants can&rsquo;t be removed here (they may be tied to past orders) — set
            stock to 0 to retire one.
          </p>
        )}
      </section>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="self-start">
        {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
      </Button>
    </form>
  );
}

export { ProductForm };
