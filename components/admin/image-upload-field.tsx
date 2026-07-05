"use client";

import * as React from "react";
import { Upload } from "lucide-react";
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
      </div>
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}

export { ImageUploadField };
