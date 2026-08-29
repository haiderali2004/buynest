import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email/notifications";

/**
 * Marks a COD or manual-wallet order as paid — the manual counterpart to
 * what `finalizeSucceededPayment` does automatically for card orders once
 * Safepay confirms a payment. Used once an admin has checked a JazzCash/
 * EasyPaisa screenshot against their own account activity, or collected
 * cash on delivery.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let adminId: string;

  try {
    const admin = await requireAdmin();
    adminId = admin.id;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }

  const { id } = await params;

  const order: {
    id: string;
    orderNumber: string;
    paymentMethod: string;
    paymentStatus: string;
    customerEmail: string | null;
    totalAmount: unknown;
    items: Array<{
      productNameSnapshot: string;
      variantDetailsSnapshot: unknown;
      quantity: number;
      subtotal: unknown;
    }>;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    } | null;
  } | null = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (order.paymentMethod === "card") {
    return NextResponse.json(
      { message: "Card orders are confirmed automatically by Safepay." },
      { status: 400 },
    );
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ message: "This order is already marked paid." }, { status: 400 });
  }

  const note =
    order.paymentMethod === "cod"
      ? "Cash payment received on delivery — confirmed manually by admin."
      : "Wallet payment screenshot verified — confirmed manually by admin.";

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: "paid", paymentStatus: "paid" },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: "paid", changedBy: adminId, note },
    });
  });

  const itemsWithVariant = order.items.map((item) => {
    const details = item.variantDetailsSnapshot as { size?: string; color?: string } | null;
    return {
      name: item.productNameSnapshot,
      size: details?.size ?? "",
      color: details?.color ?? "",
      quantity: item.quantity,
      subtotal: toNumber(item.subtotal),
    };
  });

  // manual_wallet orders never got an "order confirmed" email at checkout
  // (there was nothing to confirm yet) — this is genuinely their first
  // confirmation, so it gets the full receipt-style email. COD customers
  // already got that at checkout, so a payment-received update is enough.
  try {
    if (order.customerEmail) {
      if (order.paymentMethod === "manual_wallet") {
        await sendOrderConfirmationEmail({
          to: order.customerEmail,
          orderNumber: order.orderNumber,
          items: itemsWithVariant,
          totalAmount: toNumber(order.totalAmount),
          shippingAddress: order.shippingAddress,
        });
      } else {
        await sendOrderStatusEmail({
          to: order.customerEmail,
          orderNumber: order.orderNumber,
          status: "paid",
          note: "Cash payment received — thanks!",
        });
      }
    }
  } catch (error) {
    console.error("[admin/orders] confirm-payment email failed", error);
  }

  return NextResponse.json({ ok: true });
}
