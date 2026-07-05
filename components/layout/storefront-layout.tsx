import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/shared/chat-widget";
import type { NavCategory, NavUser } from "@/types";

async function getNavUser(): Promise<NavUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) return null;

  const metadata = (claims.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: claims.sub,
    email: claims.email ?? null,
    fullName: typeof metadata.full_name === "string" ? metadata.full_name : null,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
  };
}

async function getNavCategories(): Promise<NavCategory[]> {
  const categories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    children: Array<{ id: string; name: string; slug: string; imageUrl: string | null }>;
  }> = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 6,
    include: {
      children: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        take: 8,
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      imageUrl: child.imageUrl,
      children: [],
    })),
  }));
}

async function StorefrontLayout({ children }: { children: ReactNode }) {
  // Run independently — an auth hiccup shouldn't take down the whole nav,
  // and vice versa.
  const [user, categories] = await Promise.all([
    getNavUser().catch(() => null),
    getNavCategories().catch(() => []),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} categories={categories} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export { StorefrontLayout };
