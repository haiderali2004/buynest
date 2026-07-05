"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { profileUpdateSchema } from "@/lib/validations/account";

interface ProfileFormProps {
  email: string;
  fullName: string;
  phone: string;
}

function ProfileForm({ email, fullName: initialFullName, phone: initialPhone }: ProfileFormProps) {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [phone, setPhone] = React.useState(initialPhone);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = profileUpdateSchema.safeParse({ fullName, phone: phone || undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Couldn't save your profile.");
        return;
      }

      toast.success("Profile updated.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled className="mt-1.5 opacity-70" />
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Email changes aren&rsquo;t supported yet.
        </p>
      </div>
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="mt-1.5"
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2 self-start">
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

export { ProfileForm };
