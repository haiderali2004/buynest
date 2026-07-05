import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      // 401 (no session at all) sends them to sign in and back here;
      // 403 (signed in, but not an admin) just sends them home rather
      // than revealing that an admin area exists at this path.
      redirect(error.status === 401 ? "/login?redirect=/admin" : "/");
    }
    throw error;
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
