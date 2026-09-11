import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_ADMIN_PASSWORD = "Admin@12345";
const DEV_MEMBER_PASSWORD = "Member@12345";

/**
 * Adds `days` calendar days to a date, returned as a new Date.
 */
function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  console.log("Seeding gymflow...");

  const gym = await prisma.gym.upsert({
    where: { slug: "default-gym" },
    update: {},
    create: {
      slug: "default-gym",
      name: process.env.NEXT_PUBLIC_GYM_NAME ?? "GymFlow Fitness Club",
      phone: process.env.NEXT_PUBLIC_GYM_PHONE ?? "+911234567890",
      email: process.env.NEXT_PUBLIC_GYM_EMAIL ?? "gym@example.com",
      address: "1st Floor, MG Road",
      city: "Gurugram",
    },
  });

  const adminPasswordHash = await argon2.hash(DEV_ADMIN_PASSWORD);
  const admin = await prisma.admin.upsert({
    where: { email: "owner@gymflow.dev" },
    update: {},
    create: {
      gymId: gym.id,
      name: "Gym Owner",
      email: "owner@gymflow.dev",
      phone: "+919876500000",
      passwordHash: adminPasswordHash,
    },
  });

  const memberPasswordHash = await argon2.hash(DEV_MEMBER_PASSWORD);

  const memberSeeds = [
    {
      memberCode: "GYM-0001",
      name: "Ananya Sharma",
      phone: "+919876500001",
      email: "ananya@example.com",
      gender: "FEMALE" as const,
      heightCm: 162,
      joinDaysAgo: 120,
      planDurationDays: 180,
      startWeightKg: 68,
      currentWeightKg: 61,
      goalType: "LOSE" as const,
      targetWeightKg: 58,
    },
    {
      memberCode: "GYM-0002",
      name: "Rahul Verma",
      phone: "+919876500002",
      email: "rahul@example.com",
      gender: "MALE" as const,
      heightCm: 175,
      joinDaysAgo: 40,
      planDurationDays: 30,
      startWeightKg: 70,
      currentWeightKg: 72,
      goalType: "GAIN" as const,
      targetWeightKg: 78,
    },
    {
      memberCode: "GYM-0003",
      name: "Priya Nair",
      phone: "+919876500003",
      email: null,
      gender: "FEMALE" as const,
      heightCm: 158,
      joinDaysAgo: 400,
      planDurationDays: 30,
      startWeightKg: 55,
      currentWeightKg: 55,
      goalType: "MAINTAIN" as const,
      targetWeightKg: 55,
    },
  ];

  for (const seed of memberSeeds) {
    const joinDate = addDays(new Date(), -seed.joinDaysAgo);
    const membershipStart = joinDate;
    const membershipEnd = addDays(joinDate, seed.planDurationDays);

    const member = await prisma.member.upsert({
      where: { memberCode: seed.memberCode },
      update: {},
      create: {
        gymId: gym.id,
        memberCode: seed.memberCode,
        name: seed.name,
        phone: seed.phone,
        email: seed.email,
        passwordHash: memberPasswordHash,
        gender: seed.gender,
        heightCm: seed.heightCm,
        joinDate,
        membershipStart,
        membershipEnd,
      },
    });

    await prisma.payment.create({
      data: {
        gymId: gym.id,
        memberId: member.id,
        amountPaise: seed.planDurationDays >= 180 ? 900000 : 200000,
        method: "CASH",
        status: "SUCCESS",
        planDurationDays: seed.planDurationDays,
        paymentDate: joinDate,
        membershipStartAfter: membershipStart,
        membershipEndAfter: membershipEnd,
        notes: "Initial membership payment (seed data)",
        recordedByAdminId: admin.id,
      },
    });

    // A handful of weight log points trending from startWeightKg to currentWeightKg.
    const weightSteps = 5;
    for (let i = 0; i <= weightSteps; i++) {
      const progress = i / weightSteps;
      const weightKg =
        seed.startWeightKg + (seed.currentWeightKg - seed.startWeightKg) * progress;
      await prisma.weightLog.create({
        data: {
          gymId: gym.id,
          memberId: member.id,
          date: addDays(joinDate, Math.round(seed.joinDaysAgo * progress)),
          weightKg: Math.round(weightKg * 10) / 10,
        },
      });
    }

    await prisma.goal.upsert({
      where: { memberId: member.id },
      update: {},
      create: {
        gymId: gym.id,
        memberId: member.id,
        goalType: seed.goalType,
        targetWeightKg: seed.targetWeightKg,
        targetDate: addDays(new Date(), 90),
      },
    });

    const plan = await prisma.workoutPlan.create({
      data: {
        gymId: gym.id,
        memberId: member.id,
        title: "Full Body Starter Plan",
        notes: "3-day full body split for the first month.",
        days: {
          create: [
            {
              dayOfWeek: 1,
              title: "Day 1 - Full Body A",
              order: 0,
              exercises: {
                create: [
                  { name: "Squat", sets: 3, reps: "8-10", restSeconds: 90, order: 0 },
                  { name: "Bench Press", sets: 3, reps: "8-10", restSeconds: 90, order: 1 },
                  { name: "Bent-over Row", sets: 3, reps: "10-12", restSeconds: 60, order: 2 },
                ],
              },
            },
            {
              dayOfWeek: 3,
              title: "Day 2 - Full Body B",
              order: 1,
              exercises: {
                create: [
                  { name: "Deadlift", sets: 3, reps: "5-6", restSeconds: 120, order: 0 },
                  { name: "Overhead Press", sets: 3, reps: "8-10", restSeconds: 90, order: 1 },
                  { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 60, order: 2 },
                ],
              },
            },
          ],
        },
      },
      include: { days: true },
    });

    if (plan.days[0]) {
      await prisma.workoutCompletion.create({
        data: {
          memberId: member.id,
          workoutPlanDayId: plan.days[0].id,
          completedDate: addDays(new Date(), -2),
        },
      });
    }
  }

  await prisma.attendanceDevice.upsert({
    where: { deviceCode: "DEVICE-001" },
    update: {},
    create: {
      gymId: gym.id,
      name: "Front Desk Fingerprint Scanner",
      deviceCode: "DEVICE-001",
      location: "Main entrance",
    },
  });

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log(`Admin login:  owner@gymflow.dev / ${DEV_ADMIN_PASSWORD}`);
  console.log(`Member login: GYM-0001 / ${DEV_MEMBER_PASSWORD}`);
  console.log("Never reuse these credentials in production.");
  console.log("---------------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
