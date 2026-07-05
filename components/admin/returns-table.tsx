import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { AdminReturnListItem } from "@/lib/admin/returns";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "accent" | "destructive"> = {
  requested: "secondary",
  approved: "accent",
  rejected: "destructive",
  item_received: "accent",
  refunded: "default",
  cancelled: "destructive",
};

function ReturnsTable({ returns }: { returns: AdminReturnListItem[] }) {
  if (returns.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted-foreground">No return requests yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Reason</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Requested</th>
            <th className="px-5 py-3 text-right">Refund</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((ret) => (
            <tr key={ret.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <Link href={`/admin/returns/${ret.id}`} className="font-mono text-foreground hover:text-bottle">
                  {ret.orderNumber}
                </Link>
              </td>
              <td className="px-5 py-3 text-foreground">{ret.customerName ?? "—"}</td>
              <td className="max-w-[220px] truncate px-5 py-3 text-muted-foreground">{ret.reason}</td>
              <td className="px-5 py-3">
                <Badge variant={STATUS_VARIANT[ret.status] ?? "secondary"}>
                  {ret.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                {ret.requestedAt.toLocaleDateString("en-PK")}
              </td>
              <td className="px-5 py-3 text-right font-mono text-foreground">
                {ret.refundAmount !== null ? formatPrice(ret.refundAmount) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ReturnsTable };
