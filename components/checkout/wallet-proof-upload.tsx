"use client";

import * as React from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface WalletProofUploadProps {
  orderId: string;
}

/**
 * Uploads the screenshot straight to Supabase Storage from the browser
 * (same pattern as the admin image uploader), then tells our own API
 * which order it belongs to — the file itself never passes through our
 * server.
 */
function WalletProofUpload({ orderId }: WalletProofUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Please attach a screenshot before submitting.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const path = `${orderId}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from("payment-proofs").getPublicUrl(path);

      const response = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: data.publicUrl }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message ?? "Couldn't save your proof. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-start gap-3 border border-bottle bg-secondary px-4 py-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-bottle" />
        <div>
          <p className="text-sm font-medium text-foreground">Screenshot received</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&rsquo;ll confirm your payment shortly. You&rsquo;ll get an email once your order is
            verified and being prepared.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="proof-file"
        className="flex cursor-pointer flex-col items-center gap-2 border border-dashed border-line-strong bg-paper px-4 py-8 text-center hover:border-bottle"
      >
        <Upload className="size-5 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {file ? file.name : "Tap to attach your payment screenshot"}
        </span>
        <input
          id="proof-file"
          type="file"
          accept="image/*"
          required
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <Button type="submit" size="lg" disabled={uploading || !file}>
        {uploading ? "Uploading…" : "Submit proof of payment"}
      </Button>
    </form>
  );
}

export { WalletProofUpload };
