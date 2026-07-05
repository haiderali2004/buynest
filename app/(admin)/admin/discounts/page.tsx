import type { Metadata } from "next";
import { getAdminDiscounts } from "@/lib/admin/discounts";
import { DiscountsTable } from "@/components/admin/discounts-table";

export const metadata: Metadata = {
  title: "Discounts",
};

export default async function AdminDiscountsPage() {
  const discounts = await getAdminDiscounts();

  return <DiscountsTable discounts={discounts} />;
}
