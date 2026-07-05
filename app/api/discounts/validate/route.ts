import { NextResponse } from "next/server";
import { discountValidateSchema } from "@/lib/validations/discount";
import { priceCartItems, getSubtotal, resolveDiscount, CheckoutError } from "@/lib/orders/pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // A tighter window than the other public endpoints — this is the one
  // place someone could try to brute-force guess valid discount codes.
  const rateLimit = await checkRateLimit({
    key: `discount-validate:${getClientIp(request)}`,
    limit: 20,
    windowSeconds: 10 * 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = discountValidateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  try {
    const lineItems = await priceCartItems(parsed.data.items);
    const subtotal = getSubtotal(lineItems);
    const discount = await resolveDiscount(parsed.data.code, subtotal);

    return NextResponse.json(discount, { status: 200 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("[discounts/validate] failed", error);
    return NextResponse.json({ message: "Couldn't apply that code. Please try again." }, { status: 500 });
  }
}
