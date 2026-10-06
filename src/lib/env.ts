import { z } from "zod";

/**
 * Schema for every environment variable the app reads. Validating once at
 * import time means a missing SESSION_SECRET fails the build/boot instead of
 * surfacing as a confusing runtime error the first time someone logs in.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Required, not optional: prisma.config.ts reads this directly for
  // every CLI command (migrate, studio, db pull) - see the comment there.
  // Validating it here too means a missing value fails the app's own
  // boot immediately rather than only surfacing the next time someone
  // happens to run a migration.
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters - generate one with `openssl rand -base64 48`"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_GYM_NAME: z.string().default("Your Gym"),
  NEXT_PUBLIC_GYM_PHONE: z.string().default(""),
  NEXT_PUBLIC_GYM_EMAIL: z.string().default(""),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Thrown once, at import time - every route/action that imports `env`
    // benefits without re-checking.
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
