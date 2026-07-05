import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { adminProductSchema } from "@/lib/validations/admin-product";

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

  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid product." },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        categoryId: input.categoryId || null,
        material: input.material || null,
        careInstructions: input.careInstructions || null,
        basePrice: input.basePrice,
        compareAtPrice: input.compareAtPrice ?? null,
        isActive: input.isActive,
        variants: {
          create: input.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex || null,
            stockQuantity: variant.stockQuantity,
            priceOverride: variant.priceOverride ?? null,
          })),
        },
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            altText: input.name,
            isPrimary: image.isPrimary,
            displayOrder: index,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    console.error("[admin/products] create failed", error);
    return NextResponse.json(
      { message: "Couldn't create the product. Is the slug already taken?" },
      { status: 500 },
    );
  }
}
