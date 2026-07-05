import { Resend } from "resend";
import type { ReactElement } from "react";

/**
 * The Resend client is created lazily, on the first actual send — NOT at
 * module load. Next.js imports every route file while building, so a
 * module-scope check on RESEND_API_KEY would crash `next build` on any
 * machine that doesn't have the key set, even though no email is being
 * sent. Missing key at send time is logged, not thrown (see sendEmail).
 */
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

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
    const resend = getResend();
    if (!resend) {
      console.error("[email] RESEND_API_KEY is not set — email not sent:", input.subject);
      return;
    }

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
