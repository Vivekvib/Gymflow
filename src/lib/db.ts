import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma ORM v7 dropped the built-in Rust query engine in favor of driver
 * adapters, so a PrismaClient now needs an explicit pg Pool + PrismaPg
 * adapter rather than just a connection string.
 *
 * The globalThis cache exists purely for Next.js dev mode: every hot reload
 * re-evaluates this module, and without caching, each reload would open a
 * fresh pool without closing the last one and exhaust Postgres connections.
 * In production there's exactly one module evaluation, so the cache is a
 * no-op there.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 20 : 5,
  });

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.pgPool = pool;
}
