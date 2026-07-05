import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/auth/require-user";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  type AddressTx = {
    address: {
      updateMany: (args: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => Promise<{ count: number }>;
    };
  };

  const result: { count: number } = await prisma.$transaction(async (tx: AddressTx) => {
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.updateMany({ where: { id, userId }, data: { isDefault: true } });
  });

  if (result.count === 0) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
