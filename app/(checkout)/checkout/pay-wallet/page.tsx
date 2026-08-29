import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { WalletProofUpload } from "@/components/checkout/wallet-proof-upload";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

/**
 * Landing page for the manual JazzCash/EasyPaisa flow. The order already
 * exists (created unpaid at checkout) — this page just tells the customer
 * where to send the money and collects their screenshot as proof. An admin
 * reviews it manually afterward; there's no live wallet API integration.
 */
export default async function PayWalletPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentProofUrl: true,
      totalAmount: true,
    },
  });

  if (!order || order.paymentMethod !== "manual_wallet") {
    notFound();
  }

  const walletName = process.env.WALLET_PAYMENT_NAME ?? "Set WALLET_PAYMENT_NAME in .env";
  const walletNumber = process.env.WALLET_PAYMENT_NUMBER ?? "Set WALLET_PAYMENT_NUMBER in .env";
  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <ClearCartOnSuccess />

      <div className="text-center">
        <p className="font-mono text-xs tracking-wider text-bottle uppercase">
          Order {order.orderNumber}
        </p>
        <h1 className="mt-3 font-display text-3xl text-foreground">
          {isPaid ? "Payment verified" : "Pay via JazzCash / EasyPaisa"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPaid
            ? "Your payment has been confirmed — your order is being prepared."
            : "Send the amount below, then upload a screenshot as proof."}
        </p>
      </div>

      {!isPaid && (
        <div className="mt-10 flex flex-col gap-4">
          <div className="border border-border bg-secondary px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount due</span>
              <span className="font-mono text-lg text-foreground">
                {formatPrice(Number(order.totalAmount))}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account name</span>
              <span className="font-mono text-foreground">{walletName}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Number</span>
              <span className="font-mono text-foreground">{walletNumber}</span>
            </div>
          </div>

          {order.paymentProofUrl ? (
            <div className="flex items-start gap-3 border border-bottle bg-secondary px-4 py-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-bottle" />
              <div>
                <p className="text-sm font-medium text-foreground">Screenshot received</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&rsquo;ll confirm your payment shortly. You&rsquo;ll get an email once your
                  order is verified and being prepared.
                </p>
              </div>
            </div>
          ) : (
            <WalletProofUpload orderId={order.id} />
          )}
        </div>
      )}
    </div>
  );
}
