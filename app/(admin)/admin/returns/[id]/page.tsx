import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminReturnById } from "@/lib/admin/returns";
import { ReturnStatusForm } from "@/components/admin/return-status-form";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ret = await getAdminReturnById(id);
  return { title: ret ? `Return — ${ret.order.orderNumber}` : "Return not found" };
}

export default async function AdminReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ret = await getAdminReturnById(id);

  if (!ret) {
    notFound();
  }

  const suggestedRefundAmount = ret.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Return for{" "}
            <Link href={`/admin/orders/${ret.order.id}`} className="text-bottle hover:underline">
              {ret.order.orderNumber}
            </Link>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Requested {ret.requestedAt.toLocaleString("en-PK")}
          </p>
        </div>
        <Badge>{ret.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="border border-border bg-paper">
            <p className="border-b border-border px-5 py-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Items to return
            </p>
            <div className="divide-y divide-border">
              {ret.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="text-foreground">{item.productName}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.size} / {item.color} · Qty {item.quantity}
                      {item.restocked && (
                        <span className="ml-2 text-bottle">· restocked</span>
                      )}
                    </p>
                  </div>
                  <p className="font-mono text-foreground">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border px-5 py-4 text-sm font-medium text-foreground">
              <span>Suggested refund</span>
              <span className="font-mono">{formatPrice(suggestedRefundAmount)}</span>
            </div>
          </div>

          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Customer reason
            </p>
            <p className="mt-2 text-sm text-foreground">{ret.reason}</p>
            {ret.customerNote && (
              <p className="mt-2 text-sm text-muted-foreground">{ret.customerNote}</p>
            )}
          </div>

          {ret.adminNote && (
            <div className="border border-border bg-paper p-5">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Admin notes
              </p>
              <p className="mt-2 text-sm text-foreground">{ret.adminNote}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Customer
            </p>
            <p className="mt-2 text-sm text-foreground">{ret.customerName ?? "—"}</p>
          </div>

          <div className="border border-border bg-paper p-5">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Update status
            </p>
            <div className="mt-3">
              <ReturnStatusForm
                returnId={ret.id}
                currentStatus={ret.status}
                suggestedRefundAmount={ret.refundAmount ?? suggestedRefundAmount}
                hasPayment={Boolean(ret.order.safepayTrackerToken)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
