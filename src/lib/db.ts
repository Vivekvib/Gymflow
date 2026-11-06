import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { createPrismaAdapter } from "@/lib/prisma-adapter";

/**
 * The driver (Neon's WebSocket driver in production, plain `pg` for a local
 * database) is chosen in lib/prisma-adapter.ts - see the comment there for
 * why Neon needs its own driver on Vercel, and README's "Prisma 7 notes".
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createPrismaAdapter(env.DATABASE_URL),
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
