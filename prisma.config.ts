import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma ORM v7 moved the datasource URL and the seed command out of
// schema.prisma and into this file. Keeping it here (rather than
// hard-coding a connection string) means the same config works unchanged
// across local Docker Postgres, Neon, and Supabase.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
