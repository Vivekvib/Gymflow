/**
 * Deliberately does NOT import lib/env.ts - that module validates
 * server-only secrets (SESSION_SECRET, DATABASE_URL) and will throw if
 * evaluated in the browser. This file only touches NEXT_PUBLIC_ variables,
 * which Next.js inlines at build time into both server and client bundles,
 * so components/marketing/navbar.tsx (a Client Component) can safely
 * import it.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_GYM_NAME || "GymFlow",
  phone: process.env.NEXT_PUBLIC_GYM_PHONE || "",
  email: process.env.NEXT_PUBLIC_GYM_EMAIL || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
