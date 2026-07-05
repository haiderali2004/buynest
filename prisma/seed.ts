/**
 * Seeds the database with demo categories, products, variants, images, and
 * a sample promo code — enough to browse the catalog, add real items to
 * the cart, and walk through checkout end to end.
 *
 * Run once against a freshly migrated database:
 *   npx prisma db seed
 *
 * Safe to re-run: it checks for existing seed data first and exits without
 * creating duplicates if it finds any.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Shirts", slug: "shirts", displayOrder: 1 },
  { name: "Hoodies", slug: "hoodies", displayOrder: 2 },
  { name: "Pants", slug: "pants", displayOrder: 3 },
  { name: "Outerwear", slug: "outerwear", displayOrder: 4 },
] as const;

interface SeedVariant {
  size: string;
  color: string;
  colorHex: string;
  stockQuantity: number;
}

interface SeedProduct {
  name: string;
  slug: string;
  category: (typeof CATEGORIES)[number]["slug"];
  description: string;
  material: string;
  careInstructions: string;
  basePrice: number;
  compareAtPrice?: number;
  image: string;
  variants: SeedVariant[];
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Classic Oxford Shirt",
    slug: "classic-oxford-shirt",
    category: "shirts",
    description:
      "A wardrobe staple cut from breathable oxford cotton, with a button-down collar and a relaxed-but-tailored fit that works equally well tucked in or left loose.",
    material: "100% cotton oxford weave",
    careInstructions: "Machine wash cold, tumble dry low, warm iron if needed",
    basePrice: 2499,
    image: "/products/shirt.svg",
    variants: [
      { size: "S", color: "White", colorHex: "#F7F4ED", stockQuantity: 18 },
      { size: "M", color: "White", colorHex: "#F7F4ED", stockQuantity: 22 },
      { size: "L", color: "White", colorHex: "#F7F4ED", stockQuantity: 15 },
      { size: "XL", color: "White", colorHex: "#F7F4ED", stockQuantity: 0 },
      { size: "S", color: "Light Blue", colorHex: "#AFC4CE", stockQuantity: 12 },
      { size: "M", color: "Light Blue", colorHex: "#AFC4CE", stockQuantity: 2 },
      { size: "L", color: "Light Blue", colorHex: "#AFC4CE", stockQuantity: 9 },
    ],
  },
  {
    name: "Linen Casual Shirt",
    slug: "linen-casual-shirt",
    category: "shirts",
    description:
      "Lightweight linen with a soft drape, made for warm days. Cut slightly boxy with a single chest pocket.",
    material: "100% linen",
    careInstructions: "Hand wash cold, line dry, iron while damp",
    basePrice: 2899,
    image: "/products/shirt.svg",
    variants: [
      { size: "S", color: "Sand", colorHex: "#D8C4A0", stockQuantity: 14 },
      { size: "M", color: "Sand", colorHex: "#D8C4A0", stockQuantity: 20 },
      { size: "L", color: "Sand", colorHex: "#D8C4A0", stockQuantity: 11 },
    ],
  },
  {
    name: "Essential Pullover Hoodie",
    slug: "essential-pullover-hoodie",
    category: "hoodies",
    description:
      "Heavyweight brushed-back fleece in a relaxed fit, with a kangaroo pocket and a fixed hood. Built to soften with every wash, not fall apart.",
    material: "320gsm brushed-back cotton fleece",
    careInstructions: "Machine wash cold, do not bleach, tumble dry low",
    basePrice: 3499,
    compareAtPrice: 3999,
    image: "/products/hoodie.svg",
    variants: [
      { size: "S", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 16 },
      { size: "M", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 24 },
      { size: "L", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 19 },
      { size: "M", color: "Bottle Green", colorHex: "#24433A", stockQuantity: 8 },
      { size: "L", color: "Bottle Green", colorHex: "#24433A", stockQuantity: 13 },
    ],
  },
  {
    name: "Heavyweight Zip Hoodie",
    slug: "heavyweight-zip-hoodie",
    category: "hoodies",
    description:
      "A full-zip hoodie in dense 400gsm fleece — substantial enough to wear as outerwear on mild days, with ribbed cuffs that hold their shape.",
    material: "400gsm cotton fleece",
    careInstructions: "Machine wash cold, tumble dry low",
    basePrice: 3999,
    image: "/products/hoodie.svg",
    variants: [
      { size: "M", color: "Black", colorHex: "#1C1B17", stockQuantity: 17 },
      { size: "L", color: "Black", colorHex: "#1C1B17", stockQuantity: 21 },
      { size: "XL", color: "Black", colorHex: "#1C1B17", stockQuantity: 6 },
    ],
  },
  {
    name: "Tailored Chino Pants",
    slug: "tailored-chino-pants",
    category: "pants",
    description:
      "A slim-tapered chino with a touch of stretch for movement. Finished with a clean front and a deep, secure pocket bag.",
    material: "98% cotton, 2% elastane",
    careInstructions: "Machine wash cold, hang dry",
    basePrice: 2799,
    image: "/products/pants.svg",
    variants: [
      { size: "30", color: "Khaki", colorHex: "#C2A878", stockQuantity: 10 },
      { size: "32", color: "Khaki", colorHex: "#C2A878", stockQuantity: 18 },
      { size: "34", color: "Khaki", colorHex: "#C2A878", stockQuantity: 15 },
      { size: "30", color: "Navy", colorHex: "#2B3344", stockQuantity: 9 },
      { size: "32", color: "Navy", colorHex: "#2B3344", stockQuantity: 20 },
      { size: "34", color: "Navy", colorHex: "#2B3344", stockQuantity: 14 },
    ],
  },
  {
    name: "Relaxed Fit Trousers",
    slug: "relaxed-fit-trousers",
    category: "pants",
    description:
      "Roomier through the leg with a soft drape, in a sturdy cotton twill that breaks in well over time.",
    material: "100% cotton twill",
    careInstructions: "Machine wash cold",
    basePrice: 3199,
    image: "/products/pants.svg",
    variants: [
      { size: "30", color: "Stone", colorHex: "#C7C0AE", stockQuantity: 11 },
      { size: "32", color: "Stone", colorHex: "#C7C0AE", stockQuantity: 16 },
      { size: "34", color: "Stone", colorHex: "#C7C0AE", stockQuantity: 13 },
    ],
  },
  {
    name: "Waxed Field Jacket",
    slug: "waxed-field-jacket",
    category: "outerwear",
    description:
      "A four-pocket field jacket in waxed cotton canvas with a corduroy collar. Weather-resistant and built to be re-waxed for years of use.",
    material: "Waxed cotton canvas, corduroy collar",
    careInstructions: "Wipe clean, re-wax annually, do not machine wash",
    basePrice: 6999,
    compareAtPrice: 7999,
    image: "/products/jacket.svg",
    variants: [
      { size: "S", color: "Olive", colorHex: "#5B5E45", stockQuantity: 5 },
      { size: "M", color: "Olive", colorHex: "#5B5E45", stockQuantity: 9 },
      { size: "L", color: "Olive", colorHex: "#5B5E45", stockQuantity: 7 },
    ],
  },
  {
    name: "Merino Crewneck Sweater",
    slug: "merino-crewneck-sweater",
    category: "outerwear",
    description:
      "Fine-gauge merino wool with natural temperature regulation — warm without bulk, and soft straight out of the box.",
    material: "100% merino wool",
    careInstructions: "Hand wash cold, dry flat, do not tumble dry",
    basePrice: 5499,
    image: "/products/sweater.svg",
    variants: [
      { size: "S", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 12 },
      { size: "M", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 17 },
      { size: "L", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 0 },
    ],
  },
];

async function main() {
  const existing = await prisma.category.findUnique({ where: { slug: CATEGORIES[0].slug } });

  if (existing) {
    console.log("Seed data already present (found category 'shirts') — skipping.");
    return;
  }

  console.log("Seeding categories…");
  const categoryBySlug = new Map<string, string>();

  for (const category of CATEGORIES) {
    const created = await prisma.category.create({ data: category });
    categoryBySlug.set(category.slug, created.id);
  }

  console.log("Seeding products, variants, and images…");

  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        material: product.material,
        careInstructions: product.careInstructions,
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        categoryId: categoryBySlug.get(product.category),
        variants: {
          create: product.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            stockQuantity: variant.stockQuantity,
          })),
        },
        images: {
          create: [
            {
              url: product.image,
              altText: product.name,
              displayOrder: 0,
              isPrimary: true,
            },
          ],
        },
      },
    });
  }

  console.log("Seeding a sample promo code…");
  await prisma.discount.create({
    data: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      value: 10,
      minPurchaseAmount: 0,
      isActive: true,
    },
  });

  console.log(`Done — ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
