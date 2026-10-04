import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Uses Neon's own driver (WebSocket-based) rather than a traditional `pg`
 * TCP pool - this matters specifically because the app deploys to Vercel's
 * serverless functions. A `pg.Pool` opens a brand new TCP+TLS connection on
 * every cold invocation (each one is its own isolated process with no
 * memory of a previous connection); stacked on top of Neon's free-tier
 * compute waking from idle, that combination can exceed even a generous
 * `$transaction` timeout (see DB_TRANSACTION_OPTIONS in
 * config/constants.ts) and surface as Prisma error P2028. This is
 * Prisma's own documented recommendation for deploying to Vercel with
 * Neon - see README's Prisma 7 / Neon notes for the full story, including
 * what to revert to if this app ever moves off Neon.
 *
 * PrismaNeon (unlike @prisma/adapter-pg's PrismaPg) takes a plain config
 * object, not a pre-built Pool - it manages pooling internally.
 *
 * neonConfig.webSocketConstructor is only required below Node 22 - this
 * repo targets Node 24, so it's a no-op safety net here, not a requirement.
 */
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
