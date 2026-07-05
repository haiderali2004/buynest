import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl text-foreground">Settings</h2>
      <div>
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          Password
        </p>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
