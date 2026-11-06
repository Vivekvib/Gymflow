import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPrismaAdapter } from "../src/lib/prisma-adapter";
import { addDays, startOfZonedWeek, zonedDayOfWeek } from "../src/lib/dates";
import { calculateMembershipExtension } from "../src/modules/payments/expiry";
import { findCatalogExerciseByName } from "../src/modules/workouts/exercise-library";

/**
 * Development data: one gym, one admin and eight test members, each in a
 * different situation, so every screen and empty state can be tried without
 * typing anything in.
 *
 *   - Safe to run more than once: anything that already exists is left alone.
 *   - Dates are relative to the day you run it ("ends in 5 days" stays true).
 *   - The passwords are public (they're in this file). Run it only against a
 *     local or throwaway database, never a real gym's data - the test members
 *     would show up in the owner's member list and revenue totals.
 */

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  console.error("Refusing to seed: this looks like a production environment.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: createPrismaAdapter(process.env.DATABASE_URL ?? "") });

const DEV_ADMIN_PASSWORD = "Admin@12345";
const DEV_MEMBER_PASSWORD = "Member@12345";

const GYM = {
  slug: "default-gym",
  name: "CGR Fitness Club",
  phone: "9810740347",
  email: "gym@example.com",
  address: "F4FQ+899, Phase 4, Block G, Aya Nagar",
  city: "New Delhi 110047",
};

interface SeedPayment {
  /** Days before today the payment was taken. */
  daysAgo: number;
  planDays: number;
  amountPaise: number;
  method?: "CASH" | "UPI" | "CARD";
}

interface SeedWorkoutDay {
  dayOfWeek: number;
  title: string;
  exercises: { name: string; sets: number; reps: string; restSeconds: number }[];
}

interface SeedMember {
  memberCode: string;
  name: string;
  /** Plain 10-digit mobile number, the same form the app stores. */
  phone: string;
  email: string | null;
  gender: "MALE" | "FEMALE";
  heightCm: number | null;
  /** Days before today they joined. */
  joinedDaysAgo: number;
  active?: boolean;
  /** Oldest first. Empty means they've joined but not paid yet. */
  payments: SeedPayment[];
  weights?: { start: number; now: number };
  goal?: { type: "LOSE" | "GAIN" | "MAINTAIN"; targetKg: number };
  workoutPlan?: { title: string; notes: string; days: SeedWorkoutDay[] };
  /** What this test member is for - printed in the summary. */
  scenario: string;
}

const now = new Date();
const todayDow = zonedDayOfWeek(now);

function workoutDays(days: number[], templates: Omit<SeedWorkoutDay, "dayOfWeek">[]): SeedWorkoutDay[] {
  // Monday first, the way the app lists a week.
  const ordered = [...new Set(days)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return ordered.map((dayOfWeek, index) => {
    const template = templates[index % templates.length];
    if (!template) throw new Error("workoutDays needs at least one template");
    return { dayOfWeek, ...template };
  });
}

const FULL_BODY: Omit<SeedWorkoutDay, "dayOfWeek">[] = [
  {
    title: "Full body A",
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "Bench Press", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "Barbell Bent Over Row", sets: 3, reps: "10-12", restSeconds: 60 },
    ],
  },
  {
    title: "Full body B",
    exercises: [
      { name: "DB Romanian Deadlift", sets: 3, reps: "5-6", restSeconds: 120 },
      { name: "Seated DB Overhead Press", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "Close Neutral Grip Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 60 },
    ],
  },
  {
    title: "Full body C",
    exercises: [
      { name: "Leg Press", sets: 3, reps: "10-12", restSeconds: 90 },
      { name: "Incline Bench Press", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "Overhand Pull-Up", sets: 3, reps: "6-8", restSeconds: 90 },
    ],
  },
];

const SPLIT: Omit<SeedWorkoutDay, "dayOfWeek">[] = [
  {
    title: "Push",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "6-8", restSeconds: 120 },
      { name: "Incline Bench Press", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "Seated DB Overhead Press", sets: 3, reps: "8-10", restSeconds: 90 },
      { name: "DB Lateral Raise", sets: 3, reps: "12-15", restSeconds: 45 },
      { name: "Chest Dips", sets: 3, reps: "8-12", restSeconds: 60 },
    ],
  },
  {
    title: "Pull",
    exercises: [
      { name: "Overhand Pull-Up", sets: 4, reps: "6-8", restSeconds: 120 },
      { name: "Barbell Bent Over Row", sets: 4, reps: "8-10", restSeconds: 90 },
      { name: "Close Neutral Grip Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 60 },
      { name: "Alternating DB Curl", sets: 3, reps: "10-12", restSeconds: 45 },
    ],
  },
  {
    title: "Legs",
    exercises: [
      { name: "Hack Squat", sets: 4, reps: "8-10", restSeconds: 120 },
      { name: "Leg Press", sets: 3, reps: "10-12", restSeconds: 90 },
      { name: "DB Romanian Deadlift", sets: 3, reps: "8-10", restSeconds: 90 },
    ],
  },
];

/**
 * Amounts are illustrative seed data, not the gym's real prices.
 * Ends of each membership, counted from the payment chain, are in the comments.
 */
const MEMBERS: SeedMember[] = [
  {
    memberCode: "GYM-0001",
    name: "Ananya Sharma",
    phone: "9876500001",
    email: "ananya@example.com",
    gender: "FEMALE",
    heightCm: 162,
    joinedDaysAgo: 120,
    // One 6-month payment: ends in 60 days.
    payments: [{ daysAgo: 120, planDays: 180, amountPaise: 900000 }],
    weights: { start: 68, now: 61 },
    goal: { type: "LOSE", targetKg: 58 },
    workoutPlan: {
      title: "Full body starter plan",
      notes: "Three full-body days a week for the first month.",
      days: workoutDays([1, 3, 5], FULL_BODY),
    },
    scenario: "Active, 60 days left, full data (weight chart, goal, plan)",
  },
  {
    memberCode: "GYM-0002",
    name: "Rahul Verma",
    phone: "9876500002",
    email: "rahul@example.com",
    gender: "MALE",
    heightCm: 175,
    joinedDaysAgo: 55,
    // 30 days from day -55 to -25, renewed on the day it ended: ends in 5 days.
    payments: [
      { daysAgo: 55, planDays: 30, amountPaise: 200000, method: "UPI" },
      { daysAgo: 25, planDays: 30, amountPaise: 200000, method: "UPI" },
    ],
    weights: { start: 70, now: 72 },
    goal: { type: "GAIN", targetKg: 78 },
    scenario: "Ends in 5 days - shows in Renewals due with Remind and Renew",
  },
  {
    memberCode: "GYM-0003",
    name: "Priya Nair",
    phone: "9876500003",
    email: null,
    gender: "FEMALE",
    heightCm: 158,
    joinedDaysAgo: 42,
    // 30 days from day -42: ended 12 days ago.
    payments: [{ daysAgo: 42, planDays: 30, amountPaise: 200000 }],
    weights: { start: 55, now: 55 },
    goal: { type: "MAINTAIN", targetKg: 55 },
    scenario: "Lapsed 12 days ago - login works, renewal prompt shown",
  },
  {
    memberCode: "GYM-0004",
    name: "Arjun Mehta",
    phone: "9876500004",
    email: null,
    gender: "MALE",
    heightCm: 180,
    joinedDaysAgo: 0,
    payments: [],
    scenario: "Joined today, no payment, no plan - every empty state",
  },
  {
    memberCode: "GYM-0005",
    name: "Simran Kaur",
    phone: "9876500005",
    email: "simran@example.com",
    gender: "FEMALE",
    heightCm: 165,
    joinedDaysAgo: 200,
    active: false,
    // Ended 80 days ago.
    payments: [{ daysAgo: 110, planDays: 30, amountPaise: 200000, method: "CARD" }],
    scenario: "Deactivated - cannot sign in",
  },
  {
    memberCode: "GYM-0006",
    name: "Vikram Singh",
    phone: "9876500006",
    email: "vikram@example.com",
    gender: "MALE",
    heightCm: 178,
    joinedDaysAgo: 146,
    // Monthly for four months, then a 90-day plan on the day the last month ended: ends in 64 days.
    payments: [
      { daysAgo: 146, planDays: 30, amountPaise: 200000 },
      { daysAgo: 116, planDays: 30, amountPaise: 200000 },
      { daysAgo: 86, planDays: 30, amountPaise: 200000 },
      { daysAgo: 56, planDays: 30, amountPaise: 200000 },
      { daysAgo: 26, planDays: 90, amountPaise: 550000, method: "UPI" },
    ],
    weights: { start: 66, now: 71 },
    goal: { type: "GAIN", targetKg: 75 },
    workoutPlan: {
      title: "Push pull legs",
      notes: "Push, pull and legs across the week. Rest 60 to 120 seconds between sets.",
      // Mon, Wed, Fri plus whatever today is, so the dashboard always has a workout today.
      days: workoutDays([1, 3, 5, todayDow], SPLIT),
    },
    scenario: "Active, 64 days left, five payments (fills the revenue chart), a workout today",
  },
  {
    memberCode: "GYM-0007",
    name: "Neha Gupta",
    phone: "9876500007",
    email: null,
    gender: "FEMALE",
    heightCm: null,
    joinedDaysAgo: 12,
    // Ends in 18 days.
    payments: [{ daysAgo: 12, planDays: 30, amountPaise: 200000, method: "CASH" }],
    scenario: "Active, 18 days left, no height / weight / plan - partial data",
  },
  {
    memberCode: "GYM-0008",
    name: "Karan Malhotra",
    phone: "9876500008",
    email: "karan@example.com",
    gender: "MALE",
    heightCm: 172,
    joinedDaysAgo: 87,
    // 90-day plan from day -87: ends in 3 days.
    payments: [{ daysAgo: 87, planDays: 90, amountPaise: 550000, method: "CARD" }],
    weights: { start: 82, now: 77 },
    goal: { type: "LOSE", targetKg: 72 },
    workoutPlan: {
      title: "Fat loss circuit",
      notes: "Three days a week, keep rest short.",
      days: workoutDays([2, 4, 6], FULL_BODY),
    },
    scenario: "Ends in 3 days - the most urgent renewal",
  },
];

async function createMember(
  gymId: string,
  adminId: string,
  passwordHash: string,
  seed: SeedMember,
): Promise<"created" | "exists"> {
  const existing = await prisma.member.findUnique({ where: { memberCode: seed.memberCode } });
  if (existing) return "exists";

  const joinDate = addDays(now, -seed.joinedDaysAgo);

  // Replay the payments through the same rule the app uses, so the stored
  // expiry is exactly what recording these payments by hand would give.
  let membershipStart: Date | null = null;
  let membershipEnd: Date | null = null;
  const paymentRows = seed.payments.map((payment) => {
    const paymentDate = addDays(now, -payment.daysAgo);
    const extension = calculateMembershipExtension(membershipEnd, payment.planDays, paymentDate);
    membershipStart ??= extension.membershipStartAfter;
    membershipEnd = extension.membershipEndAfter;
    return {
      gymId,
      amountPaise: payment.amountPaise,
      method: payment.method ?? "CASH",
      status: "SUCCESS" as const,
      planDurationDays: payment.planDays,
      paymentDate,
      membershipStartAfter: extension.membershipStartAfter,
      membershipEndAfter: extension.membershipEndAfter,
      notes: "Seed data",
      recordedByAdminId: adminId,
    };
  });

  const member = await prisma.member.create({
    data: {
      gymId,
      memberCode: seed.memberCode,
      name: seed.name,
      phone: seed.phone,
      email: seed.email,
      passwordHash,
      gender: seed.gender,
      heightCm: seed.heightCm,
      active: seed.active ?? true,
      joinDate,
      membershipStart,
      membershipEnd,
    },
  });

  if (paymentRows.length > 0) {
    await prisma.payment.createMany({ data: paymentRows.map((row) => ({ ...row, memberId: member.id })) });
  }

  if (seed.weights) {
    // Six readings drifting from the starting weight to the current one.
    const readings = 5;
    const span = Math.max(seed.joinedDaysAgo, 1);
    await prisma.weightLog.createMany({
      data: Array.from({ length: readings + 1 }, (_, index) => {
        const progress = index / readings;
        const weightKg = seed.weights!.start + (seed.weights!.now - seed.weights!.start) * progress;
        return {
          gymId,
          memberId: member.id,
          date: addDays(joinDate, Math.round(span * progress)),
          weightKg: Math.round(weightKg * 10) / 10,
        };
      }),
    });
  }

  if (seed.goal) {
    await prisma.goal.create({
      data: {
        gymId,
        memberId: member.id,
        goalType: seed.goal.type,
        targetWeightKg: seed.goal.targetKg,
        targetDate: addDays(now, 90),
      },
    });
  }

  if (seed.workoutPlan) {
    for (const day of seed.workoutPlan.days) {
      for (const exercise of day.exercises) {
        if (!findCatalogExerciseByName(exercise.name)) {
          throw new Error(`Seed uses "${exercise.name}", which is not in the exercise catalog.`);
        }
      }
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        gymId,
        memberId: member.id,
        title: seed.workoutPlan.title,
        notes: seed.workoutPlan.notes,
        days: {
          create: seed.workoutPlan.days.map((day, dayIndex) => ({
            dayOfWeek: day.dayOfWeek,
            title: day.title,
            order: dayIndex,
            exercises: {
              create: day.exercises.map((exercise, exerciseIndex) => ({
                ...exercise,
                order: exerciseIndex,
              })),
            },
          })),
        },
      },
      include: { days: true },
    });

    // Tick off this week's workouts that are already in the past, so the
    // week strip and "x of y done" have something to show. On a Monday
    // there is nothing earlier in the week to tick.
    const weekStart = startOfZonedWeek(now);
    const completions = plan.days.flatMap((day) => {
      const daysIntoWeek = (day.dayOfWeek + 6) % 7;
      const completedDate = addDays(weekStart, daysIntoWeek);
      completedDate.setUTCHours(completedDate.getUTCHours() + 7);
      return completedDate < now && day.dayOfWeek !== todayDow
        ? [{ memberId: member.id, workoutPlanDayId: day.id, completedDate }]
        : [];
    });
    if (completions.length > 0) await prisma.workoutCompletion.createMany({ data: completions });
  }

  return "created";
}

async function main() {
  console.log("Seeding gymflow...");

  // `update: {}` on purpose: re-running the seed must never overwrite a gym
  // profile the owner has since edited in Settings.
  const gym = await prisma.gym.upsert({
    where: { slug: GYM.slug },
    update: {},
    create: { ...GYM, timezone: "Asia/Kolkata" },
  });

  const admin = await prisma.admin.upsert({
    where: { email: "owner@gymflow.dev" },
    update: {},
    create: {
      gymId: gym.id,
      name: "Gym Owner",
      email: "owner@gymflow.dev",
      phone: "9876500000",
      passwordHash: await argon2.hash(DEV_ADMIN_PASSWORD),
    },
  });

  const memberPasswordHash = await argon2.hash(DEV_MEMBER_PASSWORD);
  const results: string[] = [];
  for (const seed of MEMBERS) {
    const outcome = await createMember(gym.id, admin.id, memberPasswordHash, seed);
    results.push(
      `${seed.memberCode}  ${seed.phone}  ${seed.name.padEnd(15)} ${outcome === "exists" ? "(already there) " : ""}${seed.scenario}`,
    );
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
  console.log("");
  console.log("Test members (sign in with the member ID or the mobile number):");
  for (const line of results) console.log(`  ${line}`);
  console.log("");
  console.log("---------------------------------------------");
  console.log(`Admin login:   owner@gymflow.dev / ${DEV_ADMIN_PASSWORD}`);
  console.log(`Member login:  any of the above / ${DEV_MEMBER_PASSWORD}`);
  console.log("These passwords are public. Never use them on a real gym's data.");
  console.log("---------------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
