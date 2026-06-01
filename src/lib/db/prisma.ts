import "server-only";

declare global {
  var __routeTrustPrismaPromise: Promise<any> | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function getPrismaClient() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__routeTrustPrismaPromise) {
    globalThis.__routeTrustPrismaPromise = import("@prisma/client").then(({ PrismaClient }) => {
      return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    });
  }

  return globalThis.__routeTrustPrismaPromise;
}
