import "server-only";

import { getPrismaClient, isDatabaseConfigured } from "@/lib/db/prisma";

export type DatabaseStatus = "ok" | "missing" | "fail";

interface DatabaseHealth {
  status: DatabaseStatus;
  detail: string;
}

let cachedHealth: (DatabaseHealth & { checkedAt: number }) | null = null;

export async function getDatabaseHealth(force = false): Promise<DatabaseHealth> {
  if (!isDatabaseConfigured()) {
    return {
      status: "missing",
      detail: "DATABASE_URL is not configured.",
    };
  }

  const now = Date.now();
  if (!force && cachedHealth && now - cachedHealth.checkedAt < 5000) {
    return cachedHealth;
  }

  try {
    const prisma = await getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    cachedHealth = {
      status: "ok",
      detail: "Database connection is healthy.",
      checkedAt: now,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database connection failure.";
    cachedHealth = {
      status: "fail",
      detail: message,
      checkedAt: now,
    };
  }

  return cachedHealth;
}
