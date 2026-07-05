import { PrismaClient } from "@prisma/client";

// Next.js hot-reloads modules in development, which would otherwise create
// a brand new PrismaClient (and a new connection pool) on every file save.
// Caching the instance on `globalThis` survives the hot reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
