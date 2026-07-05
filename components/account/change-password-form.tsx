"use client";

import * as React from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ChangePasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    // No custom API route here on purpose — there's no Prisma equivalent
    // for "password", it only exists in Supabase Auth, so this talks to
    // Supabase directly using the signed-in browser session.
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    toast.success("Password updated.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-1.5"
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2 self-start">
        {submitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export { ChangePasswordForm };
