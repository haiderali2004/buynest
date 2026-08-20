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
  { name: "Notebooks & Paper", slug: "notebooks-paper", displayOrder: 1 },
  { name: "Pens & Writing", slug: "pens-writing", displayOrder: 2 },
  { name: "Art & Craft Supplies", slug: "art-craft", displayOrder: 3 },
  { name: "Science & Lab Kits", slug: "science-lab-kits", displayOrder: 4 },
  { name: "Geometry & Math Tools", slug: "geometry-math", displayOrder: 5 },
  { name: "Educational Models & Globes", slug: "educational-models", displayOrder: 6 },
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

const STANDARD: SeedVariant["color"] = "Standard";
const STANDARD_HEX = "#D9D2C3";

const PRODUCTS: SeedProduct[] = [
  {
    name: "Dot-Grid Bullet Journal",
    slug: "dot-grid-bullet-journal",
    category: "notebooks-paper",
    description:
      "A lay-flat dot-grid journal with a ribbon marker and an elastic closure — built for planners, sketchers, and note-takers who like structure without rules.",
    material: "120gsm acid-free paper, hardcover",
    careInstructions: "Store flat, away from direct sunlight and moisture",
    basePrice: 899,
    image: "/products/notebook.svg",
    variants: [
      { size: "A5", color: "Sand", colorHex: "#D8C4A0", stockQuantity: 24 },
      { size: "A5", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 18 },
      { size: "A6", color: "Sand", colorHex: "#D8C4A0", stockQuantity: 12 },
      { size: "A6", color: "Charcoal", colorHex: "#3A382F", stockQuantity: 0 },
    ],
  },
  {
    name: "Classic Ruled Notebook Pack",
    slug: "classic-ruled-notebook-pack",
    category: "notebooks-paper",
    description:
      "Everyday ruled notebooks in a sturdy softcover, sold as a set — keep one at your desk and a spare in your bag.",
    material: "80gsm recycled paper, softcover",
    careInstructions: "Keep dry — the cover is water-resistant but not waterproof",
    basePrice: 649,
    image: "/products/notebook.svg",
    variants: [
      { size: "3-Pack", color: "Kraft", colorHex: "#C2A878", stockQuantity: 20 },
      { size: "3-Pack", color: "Navy", colorHex: "#2B3344", stockQuantity: 16 },
      { size: "6-Pack", color: "Kraft", colorHex: "#C2A878", stockQuantity: 9 },
    ],
  },
  {
    name: "Gel Pen Set",
    slug: "gel-pen-set",
    category: "pens-writing",
    description:
      "Smooth, fast-drying gel pens that don't skip or blot, in a rollable case that keeps them upright on your desk.",
    material: "Quick-dry gel ink, ABS barrel",
    careInstructions: "Store capped and upright; keep away from direct heat",
    basePrice: 799,
    compareAtPrice: 999,
    image: "/products/pen.svg",
    variants: [
      { size: "6-Pack", color: "Classic", colorHex: "#1C1B17", stockQuantity: 30 },
      { size: "12-Pack", color: "Classic", colorHex: "#1C1B17", stockQuantity: 22 },
      { size: "12-Pack", color: "Pastel", colorHex: "#AFC4CE", stockQuantity: 15 },
      { size: "24-Pack", color: "Neon", colorHex: "#B8893E", stockQuantity: 8 },
    ],
  },
  {
    name: "Fountain Pen Starter Kit",
    slug: "fountain-pen-starter-kit",
    category: "pens-writing",
    description:
      "A beginner-friendly fountain pen with a fine nib, converter, and two ink cartridges — everything you need for your first real handwriting practice.",
    material: "Brass nib, resin barrel",
    careInstructions: "Flush with water monthly; store nib-up when not in use",
    basePrice: 1899,
    image: "/products/pen.svg",
    variants: [
      { size: "Fine Nib", color: "Black", colorHex: "#1C1B17", stockQuantity: 14 },
      { size: "Fine Nib", color: "Forest Green", colorHex: "#24433A", stockQuantity: 9 },
      { size: "Medium Nib", color: "Navy", colorHex: "#2B3344", stockQuantity: 11 },
    ],
  },
  {
    name: "Watercolor Paint Set",
    slug: "watercolor-paint-set",
    category: "art-craft",
    description:
      "Artist-grade watercolor pans with rich pigment load and smooth rewetting, in a travel tin with a built-in mixing palette.",
    material: "Non-toxic pigment pans, tin case",
    careInstructions: "Let pans dry fully before closing the lid",
    basePrice: 1299,
    compareAtPrice: 1599,
    image: "/products/art.svg",
    variants: [
      { size: "12-Color", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 19 },
      { size: "24-Color", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 15 },
      { size: "36-Color", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 6 },
    ],
  },
  {
    name: "Sketching Pencil & Charcoal Kit",
    slug: "sketching-pencil-charcoal-kit",
    category: "art-craft",
    description:
      "A graded set of sketching pencils from hard to soft, plus charcoal sticks and a kneaded eraser, in a roll-up canvas case.",
    material: "Graphite and compressed charcoal, canvas roll",
    careInstructions: "Store flat; keep charcoal sticks wrapped to avoid breakage",
    basePrice: 999,
    image: "/products/art.svg",
    variants: [
      { size: "12-Piece", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 21 },
      { size: "24-Piece", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 13 },
    ],
  },
  {
    name: "Beginner Chemistry Lab Kit",
    slug: "beginner-chemistry-lab-kit",
    category: "science-lab-kits",
    description:
      "A safe, guided introduction to chemistry with 20+ experiments, real glassware, and a full instruction booklet — built for ages 10 and up.",
    material: "Borosilicate glassware, non-hazardous reagents",
    careInstructions:
      "Store components upright; keep out of reach of children under 8; adult supervision recommended",
    basePrice: 3499,
    compareAtPrice: 3999,
    image: "/products/flask.svg",
    variants: [
      { size: "Starter", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 17 },
      { size: "Advanced", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 5 },
    ],
  },
  {
    name: "Microscope & Slide Set",
    slug: "microscope-slide-set",
    category: "science-lab-kits",
    description:
      "A 100x-1200x student microscope with LED illumination, plus a prepared slide set — sturdy enough for a classroom, simple enough for a first-timer.",
    material: "Metal frame, glass optics",
    careInstructions: "Wipe lenses with a microfiber cloth only; store covered",
    basePrice: 5999,
    image: "/products/flask.svg",
    variants: [
      { size: "Standard", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 8 },
      { size: "Classroom Pack (x5)", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 3 },
    ],
  },
  {
    name: "Precision Geometry Set",
    slug: "precision-geometry-set",
    category: "geometry-math",
    description:
      "A full drafting set — compass, dividers, protractor, set squares, and a ruler — in a hard case that holds up to a full school term.",
    material: "Stainless steel tools, PU case",
    careInstructions: "Wipe tools dry after use to prevent rusting",
    basePrice: 649,
    image: "/products/compass.svg",
    variants: [
      { size: "Standard", color: "Black", colorHex: "#1C1B17", stockQuantity: 25 },
      { size: "Standard", color: "Navy", colorHex: "#2B3344", stockQuantity: 20 },
      { size: "Standard", color: "Rose", colorHex: "#92402F", stockQuantity: 0 },
    ],
  },
  {
    name: "Scientific Calculator",
    slug: "scientific-calculator",
    category: "geometry-math",
    description:
      "A full-function scientific calculator covering algebra, trigonometry, and statistics — exam-board approved and built to survive a backpack.",
    material: "Solar and battery hybrid power, ABS casing",
    careInstructions: "Replace battery when the solar-only display dims",
    basePrice: 1799,
    image: "/products/compass.svg",
    variants: [
      { size: "Standard", color: "Black", colorHex: "#1C1B17", stockQuantity: 30 },
      { size: "Standard", color: "Blue", colorHex: "#2B3344", stockQuantity: 22 },
    ],
  },
  {
    name: "Illuminated World Globe",
    slug: "illuminated-world-globe",
    category: "educational-models",
    description:
      "A detailed political-relief globe on a wooden stand with a built-in LED light — glows to reveal a second, unlabeled map for geography practice in the dark.",
    material: "PVC globe, wood base, LED",
    careInstructions: "Dust with a dry cloth; keep away from direct sunlight",
    basePrice: 4499,
    image: "/products/globe.svg",
    variants: [
      { size: "20cm", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 10 },
      { size: "30cm", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 6 },
    ],
  },
  {
    name: "Human Anatomy Model",
    slug: "human-anatomy-model",
    category: "educational-models",
    description:
      "A removable-organ human torso model with numbered parts and a study guide — a hands-on way to learn anatomy that a textbook diagram can't match.",
    material: "Hand-painted PVC",
    careInstructions: "Wipe clean with a dry cloth; handle removable parts gently",
    basePrice: 3999,
    image: "/products/globe.svg",
    variants: [
      { size: "Desktop (30cm)", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 9 },
      { size: "Classroom (85cm)", color: STANDARD, colorHex: STANDARD_HEX, stockQuantity: 2 },
    ],
  },
];

async function main() {
  const existing = await prisma.category.findUnique({ where: { slug: CATEGORIES[0].slug } });

  if (existing) {
    console.log("Seed data already present (found category 'notebooks-paper') — skipping.");
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
