import { sendEmail } from "@/lib/email/client";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { OrderStatusEmail } from "@/lib/email/templates/order-status";
import { ReturnStatusEmail } from "@/lib/email/templates/return-status";
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
