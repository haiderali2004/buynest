import type { Metadata } from "next";
import Link from "next/link";
import { IndianRupee, ShoppingBag, Package, AlertTriangle, Eye } from "lucide-react";
import { getDashboardMetrics, getVisitorMetrics } from "@/lib/admin/analytics";
import { MetricCard } from "@/components/admin/metric-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "accent" | "destructive"> = {
  pending: "secondary",
  processing: "accent",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export default async function AdminDashboardPage() {
  const [metrics, visitorMetrics] = await Promise.all([
    getDashboardMetrics(),
    getVisitorMetrics(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">An overview of how the store is doing.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Revenue (paid orders)"
          value={formatPrice(metrics.totalRevenue)}
          icon={IndianRupee}
        />
        <MetricCard
          label="Orders"
          value={`${metrics.paidOrderCount} / ${metrics.totalOrderCount}`}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Active Products"
          value={`${metrics.activeProductCount} / ${metrics.totalProductCount}`}
          icon={Package}
        />
        <MetricCard
          label="Low Stock Variants"
          value={String(metrics.lowStockCount)}
          icon={AlertTriangle}
          accent={metrics.lowStockCount > 0}
        />
        <MetricCard
          label="Page Views (7d)"
          value={String(visitorMetrics.totalViews)}
          icon={Eye}
        />
      </div>

      <RevenueChart data={metrics.revenueByDay} />

      <div className="border border-border bg-paper">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display text-lg text-foreground">Top Pages (last 7 days)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Built on this store&rsquo;s own visitor data — for deeper insight (funnels, bounce
            rate, geography) a dedicated analytics tool would do more than this.
          </p>
        </div>
        {visitorMetrics.topPages.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No page views recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {visitorMetrics.topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-mono text-foreground">{page.path}</span>
                <span className="font-mono text-muted-foreground">{page.views} views</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border bg-paper">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-display text-lg text-foreground">Recent Orders</p>
          <Link href="/admin/orders" className="font-mono text-xs text-muted-foreground hover:text-bottle">
            View all →
          </Link>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-foreground hover:text-bottle"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{order.customerName ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("en-PK")}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-foreground">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
