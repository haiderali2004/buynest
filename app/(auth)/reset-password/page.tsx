import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-6 text-center font-display text-2xl text-white">
        Set a new password
      </h1>
      <ResetPasswordForm />
    </div>
  );
}
