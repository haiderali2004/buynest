import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="mb-6 text-center font-display text-2xl text-white">Create account</h1>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
