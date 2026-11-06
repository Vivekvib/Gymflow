import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

/**
 * Picks the right Prisma driver adapter for a connection string, so the same
 * code runs against both of the databases this project is used with:
 *
 * - Neon (production, and any Neon dev branch): Neon's WebSocket driver. It
 *   avoids a fresh TCP+TLS handshake on every cold Vercel invocation, which
 *   is what caused P2028 transaction timeouts with a plain `pg` pool. See the
 *   "Prisma 7 notes" in the README.
 * - Anything else (the `docker compose` Postgres, a local install): plain
 *   `pg`. Neon's driver only speaks to Neon's own proxy, so without this
 *   fallback a local database could not be used at all.
 *
 * Set DATABASE_DRIVER=neon or DATABASE_DRIVER=pg to override the detection,
 * for example for a self-hosted Neon-compatible proxy.
 *
 * Takes the connection string as an argument (rather than reading `env`)
 * because the seed and admin scripts use it too, outside the Next.js app.
 */
export function createPrismaAdapter(connectionString: string) {
  if (usesNeonDriver(connectionString)) {
    // Only required below Node 22; a harmless safety net on newer versions.
    neonConfig.webSocketConstructor = ws;
    return new PrismaNeon({ connectionString });
  }

  return new PrismaPg({ connectionString });
}

function usesNeonDriver(connectionString: string): boolean {
  const override = process.env.DATABASE_DRIVER?.toLowerCase();
  if (override === "neon") return true;
  if (override === "pg") return false;

  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}
