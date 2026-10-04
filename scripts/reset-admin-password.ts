import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/modules/auth/password";

// See src/lib/db.ts for why this app uses Neon's driver instead of `pg`.
neonConfig.webSocketConstructor = ws;

/**
 * Usage: pnpm admin:reset-password <email> <new-password>
 *
 * Connects using whatever DATABASE_URL is in .env - running this locally
 * with a .env pointed at a production database updates that production
 * admin's password directly; nothing needs to run on the deployed app
 * itself.
 */
const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: pnpm admin:reset-password <email> <new-password>");
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(adminEmail: string, plainTextPassword: string) {
  const passwordHash = await hashPassword(plainTextPassword);
  const admin = await prisma.admin.update({
    where: { email: adminEmail },
    data: { passwordHash },
  });
  console.log(`Password updated for ${admin.email}.`);
}

main(email, newPassword)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
