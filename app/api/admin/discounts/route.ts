import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { adminDiscountSchema } from "@/lib/validations/admin-discount";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = adminDiscountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid discount." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const discount = await prisma.discount.create({
      data: {
        code: input.code,
        description: input.description || null,
        discountType: input.discountType,
        value: input.value,
        minPurchaseAmount: input.minPurchaseAmount,
        maxUses: input.maxUses || null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: discount.id }, { status: 201 });
  } catch (error) {
    console.error("[admin/discounts] create failed", error);
    return NextResponse.json(
      { message: "Couldn't create the discount. Is the code already taken?" },
      { status: 500 },
    );
  }
}
