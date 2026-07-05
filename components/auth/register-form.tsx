"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    // If the Supabase project requires email confirmation, signUp() won't
    // return a session yet — send them to sign in once they've confirmed
    // rather than pretending they're already logged in.
    if (data.session) {
      toast.success("Account created.");
      router.push("/");
      router.refresh();
    } else {
      toast.success("Check your email to confirm your account.");
      router.push("/login");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-border bg-paper p-8"
    >
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          required
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="mt-1.5 bg-paper-dim"
        />
      </div>
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
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 bg-paper-dim"
        />
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting} className="mt-2">
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

export { RegisterForm };
