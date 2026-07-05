import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/require-admin";
import { adminProductSchema } from "@/lib/validations/admin-product";

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

  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid product." },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const existingVariants = input.variants.filter((variant) => variant.id);
  const newVariants = input.variants.filter((variant) => !variant.id);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
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
        },
      });

      for (const variant of existingVariants) {
        await tx.productVariant.update({
          where: { id: variant.id! },
          data: {
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex || null,
            stockQuantity: variant.stockQuantity,
            priceOverride: variant.priceOverride ?? null,
          },
        });
      }

      if (newVariants.length > 0) {
        await tx.productVariant.createMany({
          data: newVariants.map((variant) => ({
            productId: id,
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex || null,
            stockQuantity: variant.stockQuantity,
            priceOverride: variant.priceOverride ?? null,
          })),
        });
      }

      // Images have no other table pointing at them by id, so the simplest
      // correct sync is to replace the whole set rather than diff it.
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: input.images.map((image, index) => ({
          productId: id,
          url: image.url,
          altText: input.name,
          isPrimary: image.isPrimary,
          displayOrder: index,
        })),
      });
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("[admin/products] update failed", error);
    return NextResponse.json(
      { message: "Couldn't save the product. Is the slug already taken?" },
      { status: 500 },
    );
  }
}
