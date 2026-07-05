import type { ReactNode } from "react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
