import crypto from "node:crypto";
import Safepay from "@sfpy/node-core";

if (!process.env.SAFEPAY_SECRET_KEY) {
  throw new Error("SAFEPAY_SECRET_KEY is not set.");
}
if (!process.env.SAFEPAY_API_KEY) {
  throw new Error("SAFEPAY_API_KEY is not set.");
}

type SafepayEnv = "sandbox" | "production";

const SAFEPAY_ENV: SafepayEnv = process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";
const SAFEPAY_HOST =
  SAFEPAY_ENV === "production" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";

/**
 * The underlying card network Safepay routes through for your account.
 * Which one is actually enabled depends on how your merchant account was
 * provisioned by Safepay — check your Dashboard, or ask their onboarding
 * team, and set SAFEPAY_INTENT accordingly. "CYBERSOURCE" is the value
 * used throughout their published examples, so it's the default here.
 */
const SAFEPAY_INTENT = process.env.SAFEPAY_INTENT === "MPGS" ? "MPGS" : "CYBERSOURCE";

const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY;

/**
 * IMPORTANT — read before relying on this in production:
 *
 * Safepay's own documentation shows two different ways of constructing
 * this client: calling the module export as a plain function
 * (`require('@sfpy/node-core')(key, config)`, used in every code sample
 * on their docs site) and a typed `class Safepay` constructor (what the
 * package's own published .d.ts declares, which is what TypeScript holds
 * us to here). This codebase uses `new Safepay(...)` to satisfy the type
 * checker. I was not able to verify which form is correct against a real
 * Safepay sandbox account (that requires their merchant KYC approval,
 * which only you can complete) — if this throws at runtime, the fix is to
 * drop `new` and call it as a function instead, matching their docs.
 */
const safepay = new Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: SAFEPAY_HOST,
});

export interface CreateCheckoutSessionInput {
  amountPkr: number;
  orderId: string;
  orderNumber: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  trackerToken: string;
  checkoutUrl: string;
}

/**
 * Creates a Safepay payment session ("tracker"), a short-lived auth token,
 * and the hosted Checkout URL to send the customer to. Card details are
 * entered entirely on Safepay's own hosted page — this app never receives
 * or stores raw card data, which keeps PCI scope to a minimum, the same
 * way Stripe's hosted/Elements flow did before this swap.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  // VERIFIED FINDING: testing this against Safepay's real sandbox host
  // (with intentionally invalid credentials) confirmed the request itself
  // reaches their server correctly — but surfaced a real bug in the SDK's
  // own error handling: for some non-2xx response shapes, their internal
  // AxiosHttpClient assumes `data.status.errors` exists and throws a
  // confusing `Cannot read properties of undefined (reading 'errors')`
  // instead of a clean error when it doesn't. That's a bug in
  // @sfpy/node-core, not in this code, but it means error messages from
  // a real failure (e.g. a declined card, an invalid API key) may not
  // always be clean — keep that in mind when debugging.
  const sessionResponse = await safepay.payments.session.setup({
    merchant_api_key: SAFEPAY_API_KEY,
    intent: SAFEPAY_INTENT,
    mode: "payment",
    entry_mode: "raw",
    currency: "PKR",
    amount: Math.round(input.amountPkr * 100), // smallest denomination (paisa)
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
  });

  const trackerToken: unknown = sessionResponse?.data?.tracker?.token;

  if (typeof trackerToken !== "string" || !trackerToken) {
    throw new Error("Safepay did not return a tracker token for the payment session.");
  }

  const authResponse = await safepay.client.passport.create();
  const authToken: unknown = authResponse?.data;

  if (typeof authToken !== "string" || !authToken) {
    throw new Error("Safepay did not return an authentication token.");
  }

  const checkoutUrl: unknown = safepay.checkout.createCheckoutUrl({
    env: SAFEPAY_ENV,
    tbt: authToken,
    tracker: trackerToken,
    source: "hosted",
    order_id: input.orderId,
    redirect_url: input.returnUrl,
    cancel_url: input.cancelUrl,
  });

  if (typeof checkoutUrl !== "string" || !checkoutUrl) {
    throw new Error("Safepay did not return a checkout URL.");
  }

  return { trackerToken, checkoutUrl };
}

export interface TrackerStatus {
  state: string;
  isSucceeded: boolean;
}

/**
 * Cross-checks a tracker's status directly with Safepay. Used as a
 * fallback on the checkout success page in case the webhook hasn't
 * landed yet by the time the customer's browser redirects back —
 * mirrors the same safety net this app used with Stripe.
 */
export async function fetchTrackerStatus(trackerToken: string): Promise<TrackerStatus> {
  const response = await safepay.reporter.payments.fetch(trackerToken);
  const state: unknown = response?.data?.tracker?.state;

  return {
    state: typeof state === "string" ? state : "UNKNOWN",
    isSucceeded: state === "TRACKER_ENDED",
  };
}

export interface RefundResult {
  state: string;
}

/**
 * Issues a refund (full or partial) against a completed payment.
 *
 * VERIFICATION NOTE: Safepay's docs show two different method paths for
 * this — `order.payments.refund({ tracker, payload: { currency, amount } })`
 * in their refund guide, and `order.cancel.refund(id, params)` in the
 * published package's own .d.ts (which is what's used below, since it's
 * the one actually present in the installed SDK version). Test this
 * against your sandbox before processing a real refund with it.
 */
export async function refundPayment(trackerToken: string, amountPkr: number): Promise<RefundResult> {
  const response = await safepay.order.cancel.refund(trackerToken, {
    currency: "PKR",
    amount: Math.round(amountPkr * 100),
  });

  const state: unknown = response?.data?.tracker?.state;

  return { state: typeof state === "string" ? state : "UNKNOWN" };
}

/**
 * Verifies the `X-SFPY-SIGNATURE` header on an incoming webhook using the
 * documented manual HMAC-SHA512 algorithm, rather than an SDK helper —
 * the published `@sfpy/node-core` types don't expose a `webhooks`
 * namespace at all, so this is the verifiably-correct path per their
 * "Verify using your own solution" documentation.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  if (!process.env.SAFEPAY_WEBHOOK_SECRET) {
    throw new Error("SAFEPAY_WEBHOOK_SECRET is not set.");
  }

  const expected = crypto
    .createHmac("sha512", process.env.SAFEPAY_WEBHOOK_SECRET)
    .update(Buffer.from(rawBody))
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  // Mismatched lengths would make timingSafeEqual throw rather than
  // return false, so check that first.
  if (expectedBuffer.length !== actualBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
