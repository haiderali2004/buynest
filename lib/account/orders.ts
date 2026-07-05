import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AccountOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  itemCount: number;
}

export async function getAccountOrders(userId: string): Promise<AccountOrderListItem[]> {
  const orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: unknown;
    createdAt: Date;
    items: Array<{ quantity: number }>;
  }> = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { quantity: true } } },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: toNumber(order.totalAmount),
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

interface AccountOrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AccountOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingAddress: AccountOrderAddress | null;
  billingAddress: AccountOrderAddress | null;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    variantDetailsSnapshot: unknown;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  statusHistory: Array<{ id: string; status: string; note: string | null; createdAt: Date }>;
}

/**
 * Ownership is enforced in the query itself (`id` AND `userId` together in
 * one `findFirst`) rather than fetched-then-checked — so there's no window
 * where order data from a different account is even read into memory.
 */
export async function getAccountOrderById(
  userId: string,
  orderId: string,
): Promise<AccountOrderDetail | null> {
  const order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotal: unknown;
    discountAmount: unknown;
    shippingAmount: unknown;
    taxAmount: unknown;
    totalAmount: unknown;
    createdAt: Date;
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippingAddress: AccountOrderAddress | null;
    billingAddress: AccountOrderAddress | null;
    items: Array<{
      id: string;
      productNameSnapshot: string;
      variantDetailsSnapshot: unknown;
      unitPrice: unknown;
      quantity: number;
      subtotal: unknown;
    }>;
    statusHistory: Array<{ id: string; status: string; note: string | null; createdAt: Date }>;
  } | null = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      shippingAddress: true,
      billingAddress: true,
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: toNumber(order.subtotal),
    discountAmount: toNumber(order.discountAmount),
    shippingAmount: toNumber(order.shippingAmount),
    taxAmount: toNumber(order.taxAmount),
    totalAmount: toNumber(order.totalAmount),
    createdAt: order.createdAt,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    items: order.items.map((item) => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      variantDetailsSnapshot: item.variantDetailsSnapshot,
      unitPrice: toNumber(item.unitPrice),
      quantity: item.quantity,
      subtotal: toNumber(item.subtotal),
    })),
    statusHistory: order.statusHistory,
  };
}
