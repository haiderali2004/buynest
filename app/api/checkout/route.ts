import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/payments/safepay";
import { checkoutInputSchema } from "@/lib/validations/checkout";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  priceCartItems,
  getSubtotal,
  resolveDiscount,
  computeOrderTotals,
  CheckoutError,
} from "@/lib/orders/pricing";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit({
    key: `checkout:${getClientIp(request)}`,
    limit: 15,
    windowSeconds: 10 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many checkout attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutInputSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { message: issue?.message ?? "Invalid checkout details.", field: issue?.path.join(".") },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    // Checkout doesn't require a pre-existing account — Auth pages haven't
    // been built yet, and forcing a signup wall is bad e-commerce practice
    // either way. If there's no session, we create a real (anonymous)
    // Supabase Auth user so the order still has a genuine, RLS-compatible
    // owner. It can be upgraded to a full account later (Supabase supports
    // linking an email/password identity onto an anonymous user) once
    // Account pages exist — that upgrade is out of scope for this phase.
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    let userId = claimsData?.claims?.sub;

    if (!userId) {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !anonData.user) {
        console.error("[checkout] anonymous sign-in failed", anonError);
        return NextResponse.json(
          { message: "Couldn't start checkout. Please try again." },
          { status: 500 },
        );
      }
      userId = anonData.user.id;
    }

    // Release any abandoned reservations from past checkout attempts
    // before pricing this one — otherwise a customer who started
    // checking out 40 minutes ago and never paid would keep stock locked
    // away from everyone else indefinitely. This is the "lazy" half of
    // the reservation system — see the migration comment for why it
    // doesn't depend on a cron job to work correctly.
    await prisma.$executeRaw`SELECT public.release_expired_reservations()`;

    // Re-price everything from the database — never trust the cart's
    // client-supplied prices. Throws CheckoutError (409) on stock issues.
    const lineItems = await priceCartItems(input.items);
    const subtotal = getSubtotal(lineItems);

    const discount = input.discountCode
      ? await resolveDiscount(input.discountCode, subtotal)
      : null;

    const totals = computeOrderTotals(subtotal, discount?.amount ?? 0);

    const billing = input.billingSameAsShipping ? input.shippingAddress : input.billingAddress!;
    const reservationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const order: { id: string; orderNumber: string } = await prisma.$transaction(
      async (tx) => {
        const shippingAddress = await tx.address.create({
          data: { userId, ...toAddressRow(input.shippingAddress) },
        });

        const billingAddress = input.billingSameAsShipping
          ? shippingAddress
          : await tx.address.create({ data: { userId, ...toAddressRow(billing) } });

        const createdOrder = await tx.order.create({
          data: {
            userId,
            customerEmail: input.email,
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            shippingAmount: totals.shippingAmount,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            discountId: discount?.discountId,
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            reservationExpiresAt,
          },
          select: { id: true, orderNumber: true },
        });

        await tx.orderItem.createMany({
          data: lineItems.map((item) => ({
            orderId: createdOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productNameSnapshot: item.productName,
            variantDetailsSnapshot: { size: item.size, color: item.color },
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.lineSubtotal,
          })),
        });

        // The actual hard guarantee against overselling: this runs in the
        // SAME transaction as the order/items above, so if any variant
        // doesn't have enough stock left, decrement_variant_stock raises
        // and the whole transaction — order, items, addresses — rolls
        // back together. No order is ever created for stock that isn't
        // really there, which is what makes this a real fix rather than
        // the "decrement at payment time" approach this replaced (that
        // approach could still let two concurrent checkouts both be
        // charged for the same last unit).
        for (const item of lineItems) {
          await tx.$executeRaw`SELECT public.decrement_variant_stock(${item.variantId}::uuid, ${item.quantity}::int)`;
        }

        await tx.orderStatusHistory.create({
          data: { orderId: createdOrder.id, status: "pending", note: "Order created at checkout." },
        });

        return createdOrder;
      },
    );

    // The Safepay call happens after the DB transaction commits — it's a
    // network call to a third party and has no place inside a DB
    // transaction. If it fails here, the order is left "pending" with no
    // tracker attached; it's simply abandoned (same as any cart a shopper
    // never pays for), so no compensating rollback is needed.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await createCheckoutSession({
      amountPkr: totals.totalAmount,
      orderId: order.id,
      orderNumber: order.orderNumber,
      returnUrl: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
      cancelUrl: `${siteUrl}/checkout?canceled=true`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { safepayTrackerToken: session.trackerToken },
    });

    return NextResponse.json({
      checkoutUrl: session.checkoutUrl,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totals,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    // decrement_variant_stock raises a plain Postgres exception (not a
    // CheckoutError) when it runs inside the transaction above, since
    // Prisma's $transaction callback can't distinguish "expected business
    // error" from "unexpected failure" on its own — translate it here.
    if (error instanceof Error && error.message.includes("Insufficient stock")) {
      return NextResponse.json(
        { message: "One of the items in your cart just sold out. Please update your cart." },
        { status: 409 },
      );
    }

    console.error("[checkout] failed", error);
    return NextResponse.json(
      { message: "Something went wrong starting checkout. Please try again." },
      { status: 500 },
    );
  }
}

function toAddressRow(address: {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || null,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}
