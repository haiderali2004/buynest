import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { returnStatusUpdateSchema } from "@/lib/validations/returns";
import { refundPayment } from "@/lib/payments/safepay";
import { toNumber } from "@/lib/decimal";
import { sendReturnStatusEmail } from "@/lib/email/notifications";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
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

  const parsed = returnStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid update." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  const existing: {
    id: string;
    status: string;
    order: {
      id: string;
      orderNumber: string;
      customerEmail: string | null;
      safepayTrackerToken: string | null;
    };
    items: Array<{
      id: string;
      quantity: number;
      restocked: boolean;
      orderItem: { variantId: string; unitPrice: unknown };
    }>;
  } | null = await prisma.return.findUnique({
    where: { id },
    include: {
      order: {
        select: { id: true, orderNumber: true, customerEmail: true, safepayTrackerToken: true },
      },
      items: { include: { orderItem: { select: { variantId: true, unitPrice: true } } } },
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "Return not found." }, { status: 404 });
  }

  type ReturnTx = {
    productVariant: {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    };
    returnItem: {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    };
    return: {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    };
    order: {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    };
  };

  let emailRefundAmount: number | null = null;

  try {
    if (input.status === "item_received") {
      // Restock every item in this return that hasn't already been
      // restocked — re-runnable safely if called twice.
      await prisma.$transaction(async (tx: ReturnTx) => {
        for (const item of existing.items) {
          if (item.restocked) continue;
          await tx.productVariant.update({
            where: { id: item.orderItem.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.returnItem.update({ where: { id: item.id }, data: { restocked: true } });
        }
        await tx.return.update({
          where: { id },
          data: { status: "item_received", adminNote: input.adminNote, processedAt: new Date() },
        });
      });
    } else if (input.status === "refunded") {
      if (!existing.order.safepayTrackerToken) {
        return NextResponse.json(
          { message: "This order has no payment on record to refund." },
          { status: 400 },
        );
      }

      const suggestedAmount = existing.items.reduce(
        (sum, item) => sum + toNumber(item.orderItem.unitPrice) * item.quantity,
        0,
      );
      const refundAmount = input.refundAmount ?? suggestedAmount;
      emailRefundAmount = refundAmount;

      // The actual call to Safepay — see the verification note in
      // lib/payments/safepay.ts before relying on this against a real
      // sandbox/production account.
      const refundResult = await refundPayment(existing.order.safepayTrackerToken, refundAmount);

      await prisma.$transaction(async (tx: ReturnTx) => {
        await tx.return.update({
          where: { id },
          data: {
            status: "refunded",
            adminNote: input.adminNote,
            refundAmount,
            providerRefundReference: refundResult.state,
            refundedAt: new Date(),
            processedAt: new Date(),
          },
        });
        await tx.order.update({
          where: { id: existing.order.id },
          data: { paymentStatus: refundResult.state === "TRACKER_REFUNDED" ? "refunded" : "partially_refunded" },
        });
      });
    } else {
      // approved, rejected, cancelled — a plain status/note update, no
      // side effects on stock or payment.
      await prisma.return.update({
        where: { id },
        data: { status: input.status, adminNote: input.adminNote, processedAt: new Date() },
      });
    }

    if (existing.order.customerEmail) {
      await sendReturnStatusEmail({
        to: existing.order.customerEmail,
        orderNumber: existing.order.orderNumber,
        status: input.status,
        refundAmount: emailRefundAmount,
        adminNote: input.adminNote,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/returns] update failed", error);
    return NextResponse.json({ message: "Couldn't update this return. Please try again." }, { status: 500 });
  }
}
