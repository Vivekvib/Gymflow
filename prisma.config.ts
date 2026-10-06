import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma ORM v7 moved the datasource URL and the seed command out of
 * schema.prisma and into this file - and this file is read only by CLI
 * tools (migrate, studio, db pull), never by the running app.
 *
 * Deliberately DIRECT_URL here, not DATABASE_URL: migrations take
 * advisory locks and use prepared statements that a connection pooler
 * (PgBouncer, Neon's "-pooler" endpoint) doesn't reliably support. The
 * app's own runtime queries go through src/lib/db.ts instead, which uses
 * DATABASE_URL (the pooled connection) via the Neon driver adapter -
 * pooling is exactly what you want for many short-lived serverless
 * requests, just not for the CLI's migration locks.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
