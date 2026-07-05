import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { adminCategorySchema } from "@/lib/validations/admin-category";

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

  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid category." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        imageUrl: input.imageUrl || null,
        parentId: input.parentId || null,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: category.id }, { status: 201 });
  } catch (error) {
    console.error("[admin/categories] create failed", error);
    return NextResponse.json(
      { message: "Couldn't create the category. Is the slug already taken?" },
      { status: 500 },
    );
  }
}
