import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/auth/require-user";
import { accountAddressSchema } from "@/lib/validations/account";

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

  const parsed = accountAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid address." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  const existingCount = await prisma.address.count({ where: { userId } });
  // A person's very first address is their default whether they checked
  // the box or not — there's nothing else for "default" to mean yet.
  const isDefault = existingCount === 0 || Boolean(input.isDefault);

  type AddressTx = {
    address: {
      updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown>;
      create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
    };
  };

  const address = await prisma.$transaction(async (tx: AddressTx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return tx.address.create({
      data: {
        userId,
        label: input.label || "Address",
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault,
      },
    });
  });

  return NextResponse.json({ id: address.id }, { status: 201 });
}
