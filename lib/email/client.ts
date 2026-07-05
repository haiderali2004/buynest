import { Resend } from "resend";
import type { ReactElement } from "react";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Resend requires sending from a domain you've verified in their
 * dashboard — until that's done, sends will fail (or, in test mode, only
 * deliver to the email you signed up to Resend with). Defaulting to their
 * sandbox sender keeps local dev working out of the box; set EMAIL_FROM
 * once a real domain is verified.
 */
const EMAIL_FROM = process.env.EMAIL_FROM ?? "BuyNest <onboarding@resend.dev>";

interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
}

/**
 * Sends an email and never throws. Every call site here is a
 * notification *about* something that already happened (an order was
 * paid, a status changed) — the underlying business operation must
 * succeed or fail on its own terms regardless of whether the email
 * provider is reachable. A failed send is logged for follow-up, not
 * surfaced to the customer as a broken checkout/admin action.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      react: input.react,
    });

    if (error) {
      console.error("[email] send failed", error);
    }
  } catch (error) {
    console.error("[email] send threw", error);
  }
}
