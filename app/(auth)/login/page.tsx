import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-6 text-center font-display text-2xl text-white">Sign in</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-white/70 hover:text-white">
          Forgot your password?
        </Link>
      </p>
      <p className="mt-6 text-center text-sm text-white/70">
        New here?{" "}
        <Link href="/register" className="text-white hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
