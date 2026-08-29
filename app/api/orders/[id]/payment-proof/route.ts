import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";
import { sendNewOrderAlertEmail } from "@/lib/email/notifications";

const bodySchema = z.object({
  proofUrl: z.string().url().max(2000),
});

/**
 * Called once a customer uploads their JazzCash/EasyPaisa screenshot on the
 * pay-wallet page. The file itself already lives in Supabase Storage by the
 * time this runs (uploaded straight from the browser) — this just records
 * the URL against the order and lets the admin know it needs a manual look.
 *
 * No further verification happens automatically: there's no live wallet
 * API integration, so an admin has to actually check the screenshot against
 * their own account activity before marking the order paid.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "A valid screenshot upload is required." }, { status: 400 });
  }

  // Only accept URLs that actually point at our own Supabase Storage
  // bucket — this endpoint has no auth check beyond "knows the order id"
  // (same unguessable-UUID trust model as the storage policy itself), so
  // it shouldn't become an open way to stash an arbitrary URL on an order.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !parsed.data.proofUrl.startsWith(`${supabaseUrl}/storage/v1/object/public/payment-proofs/`)) {
    return NextResponse.json({ message: "That upload doesn't look right. Please try again." }, { status: 400 });
  }

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
    }>;
  } | null = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      customerEmail: true,
      totalAmount: true,
      items: { select: { productNameSnapshot: true, variantDetailsSnapshot: true, quantity: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (order.paymentMethod !== "manual_wallet") {
    return NextResponse.json(
      { message: "This order isn't awaiting a wallet payment proof." },
      { status: 400 },
    );
  }

  if (order.paymentStatus === "paid") {
    return NextResponse.json({ message: "This order is already marked paid." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { paymentProofUrl: parsed.data.proofUrl },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status: "pending",
        note: "Customer submitted a wallet payment screenshot — awaiting manual verification.",
      },
    });
  });

  // Best-effort — the proof is already saved either way, so a failed send
  // here shouldn't turn into an error for the customer.
  try {
    await sendNewOrderAlertEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      totalAmount: toNumber(order.totalAmount),
      items: order.items.map((item) => {
        const details = item.variantDetailsSnapshot as { size?: string; color?: string } | null;
        return {
          name: item.productNameSnapshot,
          size: details?.size ?? "",
          color: details?.color ?? "",
          quantity: item.quantity,
        };
      }),
      headline: "just submitted a wallet payment screenshot — please verify it manually.",
      proofUrl: parsed.data.proofUrl,
    });
  } catch (error) {
    console.error("[payment-proof] admin alert email failed", error);
  }

  return NextResponse.json({ ok: true });
}
