"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    // Always show the same message whether or not the email is actually
    // registered — confirming/denying an account's existence here would
    // let someone enumerate registered emails.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-border bg-paper p-8 text-center">
        <p className="text-sm text-foreground">
          If an account exists for <span className="font-medium">{email}</span>, a reset link is
          on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-border bg-paper p-8">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 bg-paper-dim"
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="mt-2">
        {submitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

export { ForgotPasswordForm };
