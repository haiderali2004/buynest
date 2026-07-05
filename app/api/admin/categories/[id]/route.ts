import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { adminCategorySchema } from "@/lib/validations/admin-category";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
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

  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid category." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  if (input.parentId === id) {
    return NextResponse.json({ message: "A category can't be its own parent." }, { status: 400 });
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        parentId: input.parentId || null,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/categories] update failed", error);
    return NextResponse.json(
      { message: "Couldn't save the category. Is the slug already taken?" },
      { status: 500 },
    );
  }
}
