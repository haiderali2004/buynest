import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/payments/safepay";
import { finalizeSucceededPayment, recordFailedPayment } from "@/lib/orders/finalize-order";

interface SafepayWebhookPayload {
  token: string;
  type: string;
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  // Signature verification needs the exact raw request bytes — parsing it
  // as JSON first (even just to re-stringify) would change whitespace and
  // break the signature check.
  const rawBody = await request.text();
  const signature = request.headers.get("x-sfpy-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhooks/safepay] signature verification failed");
    return NextResponse.json({ message: "Invalid signature." }, { status: 400 });
  }

  let event: SafepayWebhookPayload;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment.succeeded": {
        const tracker = event.data.tracker;
        const amount = event.data.amount;

        if (typeof tracker !== "string" || typeof amount !== "number") {
          console.error("[webhooks/safepay] payment.succeeded missing tracker/amount", event.data);
          break;
        }

        const result = await finalizeSucceededPayment({
          trackerToken: tracker,
          amountPkr: amount / 100,
          rawEvent: event,
        });

        if (result.status === "not_found") {
          // Don't 500 here — that would make Safepay retry forever for an
          // event that will never resolve (e.g. a tracker created outside
          // this app). Log it for visibility and acknowledge.
          console.warn("[webhooks/safepay] no matching order for tracker", tracker);
        }
        break;
      }

      case "payment.failed": {
        const tracker = event.data.tracker;
        const message = event.data.message;

        if (typeof tracker !== "string") {
          console.error("[webhooks/safepay] payment.failed missing tracker", event.data);
          break;
        }

        await recordFailedPayment({
          trackerToken: tracker,
          failureMessage: typeof message === "string" ? message : undefined,
        });
        break;
      }

      case "payment.refunded": {
        // The admin-initiated refund flow (app/api/admin/returns/[id]/route.ts)
        // is the primary path for updating the related `returns` row and
        // restocking inventory. This handler is a reconciliation safety
        // net that keeps the order's payment_status correct even if that
        // request's own DB write failed after Safepay already processed
        // the refund, or if a refund was issued directly from the Safepay
        // dashboard rather than through this app.
        const tracker = event.data.tracker;
        const balance = event.data.balance;

        if (typeof tracker !== "string") {
          console.error("[webhooks/safepay] payment.refunded missing tracker", event.data);
          break;
        }

        const order: { id: string } | null = await prisma.order.findFirst({
          where: { safepayTrackerToken: tracker },
          select: { id: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: balance === 0 ? "refunded" : "partially_refunded" },
          });
        }
        break;
      }

      default:
        // Other event types (subscriptions, authorizations, voids) aren't
        // relevant to this flow — explicitly ignored rather than erroring,
        // since Safepay sends every subscribed event type to this endpoint.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[webhooks/safepay] failed to process ${event.type}`, error);
    // A 500 here makes Safepay retry with backoff, which is what we want
    // for a transient failure (e.g. a momentary DB connection issue).
    return NextResponse.json({ message: "Webhook handler failed." }, { status: 500 });
  }
}
