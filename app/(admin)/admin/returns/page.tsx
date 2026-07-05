import type { Metadata } from "next";
import { getAdminReturns } from "@/lib/admin/returns";
import { ReturnsTable } from "@/components/admin/returns-table";

export const metadata: Metadata = {
  title: "Returns",
};

export default async function AdminReturnsPage() {
  const returns = await getAdminReturns();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Returns</h1>
        <p className="mt-1 text-sm text-muted-foreground">{returns.length} total</p>
      </div>
      <div className="border border-border bg-paper">
        <ReturnsTable returns={returns} />
      </div>
    </div>
  );
}
