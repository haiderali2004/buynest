import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-6 text-center font-display text-2xl text-white">
        Reset your password
      </h1>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-white/70">
        <Link href="/login" className="text-white hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
