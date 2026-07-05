import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  customerName: string | null;
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: unknown;
    createdAt: Date;
    shippingAddress: { fullName: string } | null;
  }> = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { shippingAddress: { select: { fullName: true } } },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: toNumber(order.totalAmount),
    createdAt: order.createdAt,
    customerName: order.shippingAddress?.fullName ?? null,
  }));
}

interface AdminOrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface AdminOrderItem {
  id: string;
  productNameSnapshot: string;
  variantDetailsSnapshot: unknown;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface AdminOrderStatusEvent {
  id: string;
  status: string;
  note: string | null;
  createdAt: Date;
}

export interface AdminOrderDetail {
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
  shippingAddress: AdminOrderAddress | null;
  billingAddress: AdminOrderAddress | null;
  items: AdminOrderItem[];
  statusHistory: AdminOrderStatusEvent[];
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
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
    shippingAddress: AdminOrderAddress | null;
    billingAddress: AdminOrderAddress | null;
    items: Array<{
      id: string;
      productNameSnapshot: string;
      variantDetailsSnapshot: unknown;
      unitPrice: unknown;
      quantity: number;
      subtotal: unknown;
    }>;
    statusHistory: AdminOrderStatusEvent[];
  } | null = await prisma.order.findUnique({
    where: { id },
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
