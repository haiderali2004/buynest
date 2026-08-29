"use client";

import * as React from "react";
import { Upload, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}

/**
 * Lets admin either paste an image URL directly (the original behavior —
 * useful for the SVG placeholders already in /public) or upload a real
 * file to Supabase Storage. Uploading just fills in the same URL field,
 * so nothing downstream needs to know which path was used.
 */
function ImageUploadField({ id, label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewFailed, setPreviewFailed] = React.useState(false);

  // Reset the "couldn't load" state whenever the URL itself changes, so
  // switching to a different/corrected URL gets a fresh attempt instead of
  // staying stuck on the previous URL's failure. Adjusting state during
  // render (rather than an effect) to avoid an extra render pass.
  const [previewedValue, setPreviewedValue] = React.useState(value);
  if (previewedValue !== value) {
    setPreviewedValue(value);
    if (previewFailed) setPreviewFailed(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError("Upload failed. Please try again, or paste a URL instead.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={id}
          placeholder="/products/shirt.svg or https://…"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1"
        />
        <label
          htmlFor={`${id}-upload`}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-input bg-paper px-3 text-sm text-foreground hover:bg-secondary"
        >
          <Upload className="size-4" />
          {uploading ? "Uploading…" : "Upload"}
          <input
            id={`${id}-upload`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          disabled={!value}
          aria-label={showPreview ? "Hide preview" : "Preview image"}
          aria-pressed={showPreview}
          className="flex shrink-0 items-center justify-center border border-input bg-paper px-3 text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper"
        >
          {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}

      {showPreview && value && (
        <div className="mt-2 border border-border bg-secondary p-2">
          {previewFailed ? (
            <p className="py-4 text-center text-xs text-clay">
              Couldn&rsquo;t load that URL as an image.
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- previewing an arbitrary admin-entered URL, not a local/optimizable asset
            <img
              src={value}
              alt="Preview"
              className="mx-auto max-h-48 w-auto object-contain"
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export { ImageUploadField };
