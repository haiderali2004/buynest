import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 14;
const VISITOR_WINDOW_DAYS = 7;

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  customerName: string | null;
}

export interface DashboardMetrics {
  totalRevenue: number;
  paidOrderCount: number;
  totalOrderCount: number;
  totalProductCount: number;
  activeProductCount: number;
  lowStockCount: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  recentOrders: RecentOrder[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const paidOrders: Array<{ totalAmount: unknown; createdAt: Date }> = await prisma.order.findMany(
    {
      where: { paymentStatus: "paid" },
      select: { totalAmount: true, createdAt: true },
    },
  );

  const [totalOrderCount, totalProductCount, activeProductCount, lowStockCount, recentOrdersRaw]: [
    number,
    number,
    number,
    number,
    Array<{
      id: string;
      orderNumber: string;
      status: string;
      paymentStatus: string;
      totalAmount: unknown;
      createdAt: Date;
      shippingAddress: { fullName: string } | null;
    }>,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        shippingAddress: { select: { fullName: true } },
      },
    }),
  ]);

  const totalRevenue =
    Math.round(paidOrders.reduce((sum, order) => sum + toNumber(order.totalAmount), 0) * 100) /
    100;

  const revenueByDayMap = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const day = new Date();
    day.setDate(day.getDate() - (CHART_DAYS - 1 - i));
    revenueByDayMap.set(day.toISOString().slice(0, 10), 0);
  }
  for (const order of paidOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (revenueByDayMap.has(key)) {
      revenueByDayMap.set(key, (revenueByDayMap.get(key) ?? 0) + toNumber(order.totalAmount));
    }
  }

  return {
    totalRevenue,
    paidOrderCount: paidOrders.length,
    totalOrderCount,
    totalProductCount,
    activeProductCount,
    lowStockCount,
    revenueByDay: [...revenueByDayMap.entries()].map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    })),
    recentOrders: recentOrdersRaw.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: toNumber(order.totalAmount),
      createdAt: order.createdAt,
      customerName: order.shippingAddress?.fullName ?? null,
    })),
  };
}

export interface VisitorMetrics {
  totalViews: number;
  viewsByDay: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
}

/**
 * Built on this app's own page_views table (see migration 0007) rather
 * than a third-party analytics tool — genuinely useful for "what's
 * getting traffic this week", but not a substitute for a dedicated
 * product if you want funnels, bounce rate, or geography.
 */
export async function getVisitorMetrics(): Promise<VisitorMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - VISITOR_WINDOW_DAYS);

  const views: Array<{ path: string; createdAt: Date }> = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { path: true, createdAt: true },
  });

  const viewsByDayMap = new Map<string, number>();
  for (let i = 0; i < VISITOR_WINDOW_DAYS; i++) {
    const day = new Date();
    day.setDate(day.getDate() - (VISITOR_WINDOW_DAYS - 1 - i));
    viewsByDayMap.set(day.toISOString().slice(0, 10), 0);
  }

  const pathCounts = new Map<string, number>();
  for (const view of views) {
    const dayKey = view.createdAt.toISOString().slice(0, 10);
    if (viewsByDayMap.has(dayKey)) {
      viewsByDayMap.set(dayKey, (viewsByDayMap.get(dayKey) ?? 0) + 1);
    }
    pathCounts.set(view.path, (pathCounts.get(view.path) ?? 0) + 1);
  }

  const topPages = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, pathViews]) => ({ path, views: pathViews }));

  return {
    totalViews: views.length,
    viewsByDay: [...viewsByDayMap.entries()].map(([date, dayViews]) => ({ date, views: dayViews })),
    topPages,
  };
}
