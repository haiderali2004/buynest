import { sendEmail } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { OrderStatusEmail } from "@/lib/email/templates/order-status";
import { ReturnStatusEmail } from "@/lib/email/templates/return-status";
import { NewOrderAlertEmail } from "@/lib/email/templates/new-order-alert";
import { formatPrice } from "@/lib/utils";

export interface OrderConfirmationInput {
  to: string;
  orderNumber: string;
  items: Array<{ name: string; size: string; color: string; quantity: number; subtotal: number }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}

export async function sendOrderConfirmationEmail(input: OrderConfirmationInput): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: `Order confirmed — ${input.orderNumber}`,
    react: (
      <OrderConfirmationEmail
        orderNumber={input.orderNumber}
        items={input.items.map((item) => ({ ...item, subtotal: formatPrice(item.subtotal) }))}
        totalAmount={formatPrice(input.totalAmount)}
        shippingAddress={input.shippingAddress}
      />
    ),
  });
}

export interface NewOrderAlertInput {
  orderId: string;
  orderNumber: string;
  customerEmail: string | null;
  totalAmount: number;
  items: Array<{ name: string; size: string; color: string; quantity: number }>;
  /** Overrides the default "was just paid" line — used for COD (placed,
   * not paid) and manual-wallet (proof submitted, needs verification). */
  headline?: string;
  proofUrl?: string;
}

/**
 * Tells the store owner an order needs their attention — either a paid
 * card order to fulfill, a COD order that was just placed, or a
 * manual-wallet order whose payment proof needs manual verification. A
 * no-op if ADMIN_NOTIFICATION_EMAIL isn't set — this is an optional
 * convenience on top of checking the /admin/orders dashboard directly, not
 * something the order flow depends on, so a missing address just means "no
 * alert" rather than an error.
 */
export async function sendNewOrderAlertEmail(input: NewOrderAlertInput): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await sendEmail({
    to: adminEmail,
    subject: `New order — ${input.orderNumber} (${formatPrice(input.totalAmount)})`,
    react: (
      <NewOrderAlertEmail
        orderNumber={input.orderNumber}
        orderUrl={`${siteUrl}/admin/orders/${input.orderId}`}
        customerEmail={input.customerEmail}
        totalAmount={formatPrice(input.totalAmount)}
        items={input.items}
        headline={input.headline}
        proofUrl={input.proofUrl}
      />
    ),
  });
}

export interface OrderStatusNotificationInput {
  to: string;
  orderNumber: string;
  status: string;
  note?: string | null;
}

export async function sendOrderStatusEmail(input: OrderStatusNotificationInput): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: `Order ${input.orderNumber} update`,
    react: (
      <OrderStatusEmail orderNumber={input.orderNumber} status={input.status} note={input.note} />
    ),
  });
}

export interface ReturnStatusNotificationInput {
  to: string;
  orderNumber: string;
  status: string;
  refundAmount?: number | null;
  adminNote?: string | null;
}

export async function sendReturnStatusEmail(input: ReturnStatusNotificationInput): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: `Return update — ${input.orderNumber}`,
    react: (
      <ReturnStatusEmail
        orderNumber={input.orderNumber}
        status={input.status}
        refundAmount={
          input.refundAmount !== null && input.refundAmount !== undefined
            ? formatPrice(input.refundAmount)
            : null
        }
        adminNote={input.adminNote}
      />
    ),
  });
}
