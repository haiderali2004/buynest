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
    // Two steps rather than one nested create: an image needs the *real*
    // id of a just-created variant to link to (matched by color), and
    // Prisma can't hand that back within the same nested-create call.
    const productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          categoryId: input.categoryId || null,
          material: input.material || null,
          careInstructions: input.careInstructions || null,
          kitContents: input.kitContents || null,
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
        },
        select: { id: true, variants: { select: { id: true, color: true } } },
      });

      // First variant of each color — enough to key off, since the display
      // side matches by the variant's *color*, not this exact variant id.
      const colorToVariantId = new Map(product.variants.map((v) => [v.color, v.id]));

      await tx.productImage.createMany({
        data: input.images.map((image, index) => ({
          productId: product.id,
          url: image.url,
          altText: input.name,
          isPrimary: image.isPrimary,
          displayOrder: index,
          variantId: image.color ? (colorToVariantId.get(image.color) ?? null) : null,
        })),
      });

      return product.id;
    });

    return NextResponse.json({ id: productId }, { status: 201 });
  } catch (error) {
    console.error("[admin/products] create failed", error);
    return NextResponse.json(
      { message: "Couldn't create the product. Is the slug already taken?" },
      { status: 500 },
    );
  }
}
