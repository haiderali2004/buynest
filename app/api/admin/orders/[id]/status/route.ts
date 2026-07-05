import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { orderStatusUpdateSchema } from "@/lib/validations/admin-order";
import { sendOrderStatusEmail } from "@/lib/email/notifications";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = orderStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid status." },
      { status: 400 },
    );
  }

  try {
    type StatusUpdateTx = {
      order: { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> };
      orderStatusHistory: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> };
    };

    await prisma.$transaction(async (tx: StatusUpdateTx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: parsed.data.status,
          ...(parsed.data.carrier ? { carrier: parsed.data.carrier } : {}),
          ...(parsed.data.trackingNumber ? { trackingNumber: parsed.data.trackingNumber } : {}),
          ...(parsed.data.trackingUrl ? { trackingUrl: parsed.data.trackingUrl } : {}),
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: parsed.data.status,
          changedBy: adminId,
          note: parsed.data.note || null,
        },
      });
    });

    const order: { orderNumber: string; customerEmail: string | null; trackingUrl: string | null } | null =
      await prisma.order.findUnique({
        where: { id },
        select: { orderNumber: true, customerEmail: true, trackingUrl: true },
      });

    if (order?.customerEmail) {
      const trackingNote = order.trackingUrl ? `Track your package: ${order.trackingUrl}` : null;
      await sendOrderStatusEmail({
        to: order.customerEmail,
        orderNumber: order.orderNumber,
        status: parsed.data.status,
        note: [parsed.data.note, trackingNote].filter(Boolean).join(" — ") || undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/orders] status update failed", error);
    return NextResponse.json({ message: "Couldn't update order status." }, { status: 500 });
  }
}
