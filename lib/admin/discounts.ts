import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/decimal";

export interface AdminDiscountListItem {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  value: number;
  minPurchaseAmount: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

export async function getAdminDiscounts(): Promise<AdminDiscountListItem[]> {
  const discounts: Array<{
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    value: unknown;
    minPurchaseAmount: unknown;
    maxUses: number | null;
    usedCount: number;
    startsAt: Date;
    expiresAt: Date | null;
    isActive: boolean;
  }> = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });

  return discounts.map((discount) => ({
    id: discount.id,
    code: discount.code,
    description: discount.description,
    discountType: discount.discountType,
    value: toNumber(discount.value),
    minPurchaseAmount: toNumber(discount.minPurchaseAmount),
    maxUses: discount.maxUses,
    usedCount: discount.usedCount,
    startsAt: discount.startsAt,
    expiresAt: discount.expiresAt,
    isActive: discount.isActive,
  }));
}
