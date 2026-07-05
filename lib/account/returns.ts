import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AccountReturnListItem {
  id: string;
  orderNumber: string;
  status: string;
  reason: string;
  refundAmount: number | null;
  requestedAt: Date;
}

export async function getAccountReturns(userId: string): Promise<AccountReturnListItem[]> {
  const returns: Array<{
    id: string;
    status: string;
    reason: string;
    refundAmount: unknown;
    requestedAt: Date;
    order: { orderNumber: string };
  }> = await prisma.return.findMany({
    where: { userId },
    orderBy: { requestedAt: "desc" },
    include: { order: { select: { orderNumber: true } } },
  });

  return returns.map((r) => ({
    id: r.id,
    orderNumber: r.order.orderNumber,
    status: r.status,
    reason: r.reason,
    refundAmount: r.refundAmount !== null ? toNumber(r.refundAmount) : null,
    requestedAt: r.requestedAt,
  }));
}

/** The return (if any) tied to a specific order, scoped to its owner. */
export async function getReturnForOrder(userId: string, orderId: string) {
  const existing: { id: string; status: string } | null = await prisma.return.findFirst({
    where: { orderId, userId },
    select: { id: true, status: true },
    orderBy: { requestedAt: "desc" },
  });

  return existing;
}

export interface ReturnableOrderItem {
  orderItemId: string;
  productName: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  purchasedQuantity: number;
  alreadyRequestedQuantity: number;
  returnableQuantity: number;
}

/**
 * For the "request a return" form: every item on a paid order, minus
 * whatever quantity is already covered by a non-rejected/non-cancelled
 * return request, so a customer can't request a return for more units
 * than they actually have left to return.
 */
export async function getReturnableOrderItems(
  userId: string,
  orderId: string,
): Promise<ReturnableOrderItem[]> {
  const order: {
    id: string;
    paymentStatus: string;
    items: Array<{
      id: string;
      productNameSnapshot: string;
      variantDetailsSnapshot: unknown;
      unitPrice: unknown;
      quantity: number;
    }>;
  } | null = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      paymentStatus: true,
      items: true,
    },
  });

  if (!order || order.paymentStatus !== "paid") return [];

  const alreadyRequested: Array<{ orderItemId: string; quantity: number }> =
    await prisma.returnItem.findMany({
      where: {
        orderItemId: { in: order.items.map((item) => item.id) },
        return: { status: { notIn: ["rejected", "cancelled"] } },
      },
      select: { orderItemId: true, quantity: true },
    });

  const requestedByItem = new Map<string, number>();
  for (const row of alreadyRequested) {
    requestedByItem.set(row.orderItemId, (requestedByItem.get(row.orderItemId) ?? 0) + row.quantity);
  }

  return order.items.map((item) => {
    const details = item.variantDetailsSnapshot as { size?: string; color?: string } | null;
    const alreadyRequestedQuantity = requestedByItem.get(item.id) ?? 0;

    return {
      orderItemId: item.id,
      productName: item.productNameSnapshot,
      size: details?.size ?? null,
      color: details?.color ?? null,
      unitPrice: toNumber(item.unitPrice),
      purchasedQuantity: item.quantity,
      alreadyRequestedQuantity,
      returnableQuantity: Math.max(item.quantity - alreadyRequestedQuantity, 0),
    };
  });
}
