import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/auth/require-user";
import { accountAddressSchema } from "@/lib/validations/account";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = accountAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // `updateMany` (not `update`) is used throughout so ownership — `id`
  // *and* `userId` together — is enforced inside the query itself, not as
  // a separate check that a race condition could slip past.
  const result = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return tx.address.updateMany({
      where: { id, userId },
      data: {
        label: input.label || "Address",
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  });

  if (result.count === 0) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  const result: { count: number } = await prisma.address.deleteMany({ where: { id, userId } });

  if (result.count === 0) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
