import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: pnpm admin:reset-password <email> <new-password>");
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
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
    await pool.end();
  });