import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AdminReturnListItem {
  id: string;
  orderNumber: string;
  status: string;
  reason: string;
  refundAmount: number | null;
  requestedAt: Date;
  customerName: string | null;
}

export async function getAdminReturns(): Promise<AdminReturnListItem[]> {
  const returns: Array<{
    id: string;
    status: string;
    reason: string;
    refundAmount: unknown;
    requestedAt: Date;
    order: { orderNumber: string; shippingAddress: { fullName: string } | null };
  }> = await prisma.return.findMany({
    orderBy: { requestedAt: "desc" },
    include: { order: { select: { orderNumber: true, shippingAddress: { select: { fullName: true } } } } },
  });

  return returns.map((r) => ({
    id: r.id,
    orderNumber: r.order.orderNumber,
    status: r.status,
    reason: r.reason,
    refundAmount: r.refundAmount !== null ? toNumber(r.refundAmount) : null,
    requestedAt: r.requestedAt,
    customerName: r.order.shippingAddress?.fullName ?? null,
  }));
}

export interface AdminReturnItemDetail {
  id: string;
  quantity: number;
  restocked: boolean;
  productName: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  variantId: string;
}

export interface AdminReturnDetail {
  id: string;
  status: string;
  reason: string;
  customerNote: string | null;
  adminNote: string | null;
  refundAmount: number | null;
  requestedAt: Date;
  processedAt: Date | null;
  refundedAt: Date | null;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    safepayTrackerToken: string | null;
    paymentStatus: string;
  };
  customerName: string | null;
  items: AdminReturnItemDetail[];
}

export async function getAdminReturnById(id: string): Promise<AdminReturnDetail | null> {
  const ret: {
    id: string;
    status: string;
    reason: string;
    customerNote: string | null;
    adminNote: string | null;
    refundAmount: unknown;
    requestedAt: Date;
    processedAt: Date | null;
    refundedAt: Date | null;
    order: {
      id: string;
      orderNumber: string;
      totalAmount: unknown;
      safepayTrackerToken: string | null;
      paymentStatus: string;
      shippingAddress: { fullName: string } | null;
    };
    items: Array<{
      id: string;
      quantity: number;
      restocked: boolean;
      orderItem: {
        productNameSnapshot: string;
        variantDetailsSnapshot: unknown;
        unitPrice: unknown;
        variantId: string;
      };
    }>;
  } | null = await prisma.return.findUnique({
    where: { id },
    include: {
      order: { select: { id: true, orderNumber: true, totalAmount: true, safepayTrackerToken: true, paymentStatus: true, shippingAddress: { select: { fullName: true } } } },
      items: { include: { orderItem: true } },
    },
  });

  if (!ret) return null;

  return {
    id: ret.id,
    status: ret.status,
    reason: ret.reason,
    customerNote: ret.customerNote,
    adminNote: ret.adminNote,
    refundAmount: ret.refundAmount !== null ? toNumber(ret.refundAmount) : null,
    requestedAt: ret.requestedAt,
    processedAt: ret.processedAt,
    refundedAt: ret.refundedAt,
    order: {
      id: ret.order.id,
      orderNumber: ret.order.orderNumber,
      totalAmount: toNumber(ret.order.totalAmount),
      safepayTrackerToken: ret.order.safepayTrackerToken,
      paymentStatus: ret.order.paymentStatus,
    },
    customerName: ret.order.shippingAddress?.fullName ?? null,
    items: ret.items.map((item) => {
      const details = item.orderItem.variantDetailsSnapshot as {
        size?: string;
        color?: string;
      } | null;
      return {
        id: item.id,
        quantity: item.quantity,
        restocked: item.restocked,
        productName: item.orderItem.productNameSnapshot,
        size: details?.size ?? null,
        color: details?.color ?? null,
        unitPrice: toNumber(item.orderItem.unitPrice),
        variantId: item.orderItem.variantId,
      };
    }),
  };
}
