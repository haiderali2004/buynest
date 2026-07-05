"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

    if (signInError) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    toast.success("Signed in.");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-border bg-paper p-8"
    >
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
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 bg-paper-dim"
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="mt-2">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export { LoginForm };
