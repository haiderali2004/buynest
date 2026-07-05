import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/auth/require-user";
import { returnRequestSchema } from "@/lib/validations/returns";
import { getReturnableOrderItems } from "@/lib/account/returns";

export async function POST(request: Request) {
  let userId: string;

  try {
    const user = await requireUser();
    userId = user.id;
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = returnRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid return request." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Re-derive what's actually returnable server-side — never trust
  // quantities the client claims are available. This also implicitly
  // checks order ownership (the helper scopes by userId) and that the
  // order was actually paid.
  const returnable = await getReturnableOrderItems(userId, input.orderId);

  if (returnable.length === 0) {
    return NextResponse.json(
      { message: "This order isn't eligible for a return." },
      { status: 400 },
    );
  }

  const returnableById = new Map(returnable.map((item) => [item.orderItemId, item]));

  for (const requestedItem of input.items) {
    const match = returnableById.get(requestedItem.orderItemId);
    if (!match || requestedItem.quantity > match.returnableQuantity) {
      return NextResponse.json(
        { message: "One of the selected items can't be returned in that quantity." },
        { status: 400 },
      );
    }
  }

  try {
    const created = await prisma.return.create({
      data: {
        orderId: input.orderId,
        userId,
        reason: input.reason,
        customerNote: input.customerNote || null,
        items: {
          create: input.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("[account/returns] create failed", error);
    return NextResponse.json(
      { message: "Couldn't submit your return request. Please try again." },
      { status: 500 },
    );
  }
}
