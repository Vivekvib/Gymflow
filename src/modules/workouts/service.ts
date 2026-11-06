import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAuditLog } from "@/lib/audit";
import { DB_TRANSACTION_OPTIONS } from "@/config/constants";
import { DEFAULT_TIMEZONE, startOfZonedDay, startOfZonedWeek, zonedDayOfWeek } from "@/lib/dates";
import type { WorkoutPlanInput } from "@/modules/workouts/validation";

/**
 * A member has at most one plan that matters right now (active: true).
 * Returns null - never throws - both when the member has no plan yet and
 * when memberId doesn't belong to gymId, so callers get the same "nothing
 * to show" result either way (tenant isolation).
 */
export async function getWorkoutPlan(gymId: string, memberId: string) {
  const member = await db.member.findFirst({ where: { id: memberId, gymId }, select: { id: true } });
  if (!member) return null;

  return db.workoutPlan.findFirst({
    where: { gymId, memberId, active: true },
    include: {
      days: {
        include: { exercises: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
}

/**
 * For the admin workout list: every active member with whether they have a
 * plan yet, without pulling every day/exercise row just to show a badge.
 */
export async function listMembersWithPlanStatus(gymId: string) {
  const members = await db.member.findMany({
    where: { gymId, active: true },
    select: {
      id: true,
      name: true,
      memberCode: true,
      workoutPlans: {
        where: { active: true },
        select: { title: true },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    memberCode: member.memberCode,
    planTitle: member.workoutPlans?.[0]?.title ?? null,
  }));
}

/**
 * Creates the member's plan if none exists, otherwise updates it -
 * replacing all days/exercises wholesale. Diffing which individual days or
 * exercises changed would add real complexity for no real benefit here:
 * the form always submits the entire plan, so delete-and-recreate inside
 * one transaction is simpler and just as correct. Plan *history* isn't
 * tracked (this always overwrites "the" plan) - the schema supports
 * multiple plans per member later if that's ever needed.
 */
export async function upsertWorkoutPlan(
  gymId: string,
  memberId: string,
  input: WorkoutPlanInput,
  actorAdminId: string,
) {
  const member = await db.member.findFirst({ where: { id: memberId, gymId } });
  if (!member) throw new NotFoundError("Member");

  const existingPlan = await db.workoutPlan.findFirst({ where: { gymId, memberId, active: true } });

  const plan = await db.$transaction(async (tx) => {
    const planRecord = existingPlan
      ? await tx.workoutPlan.update({
          where: { id: existingPlan.id },
          data: { title: input.title, notes: input.notes || null },
        })
      : await tx.workoutPlan.create({
          data: { gymId, memberId, title: input.title, notes: input.notes || undefined },
        });

    // Cascades to PlanExercise via the schema's onDelete: Cascade.
    await tx.workoutPlanDay.deleteMany({ where: { workoutPlanId: planRecord.id } });

    for (const [dayIndex, day] of input.days.entries()) {
      await tx.workoutPlanDay.create({
        data: {
          workoutPlanId: planRecord.id,
          dayOfWeek: day.dayOfWeek,
          title: day.title,
          order: dayIndex,
          exercises: {
            create: day.exercises.map((exercise, exerciseIndex) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              restSeconds: exercise.restSeconds,
              notes: exercise.notes || undefined,
              order: exerciseIndex,
            })),
          },
        },
      });
    }

    return planRecord;
  }, DB_TRANSACTION_OPTIONS);

  await recordAuditLog({
    gymId,
    actorType: "ADMIN",
    actorId: actorAdminId,
    action: existingPlan ? "WORKOUT_PLAN_UPDATED" : "WORKOUT_PLAN_CREATED",
    entityType: "WorkoutPlan",
    entityId: plan.id,
  });

  return plan;
}

// ---------------------------------------------------------------------------
// Member-side tracking: which plan days the member has done
// ---------------------------------------------------------------------------

async function getGymTimezone(gymId: string): Promise<string> {
  const gym = await db.gym.findUnique({ where: { id: gymId }, select: { timezone: true } });
  return gym?.timezone ?? DEFAULT_TIMEZONE;
}

export interface WorkoutOverview {
  plan: NonNullable<Awaited<ReturnType<typeof getWorkoutPlan>>>;
  /** 0 = Sunday .. 6 = Saturday, in the gym's timezone. */
  todayDayOfWeek: number;
  /** Plan day ids the member has marked done at any point this (Monday-start) week. */
  doneThisWeek: ReadonlySet<string>;
  /** Plan day ids marked done today. */
  doneToday: ReadonlySet<string>;
}

/**
 * The member's plan plus what they've ticked off. "Today" and "this week" are
 * the gym's (IST), so a workout marked at 11pm doesn't count for tomorrow.
 * Returns null when the member has no plan.
 */
export async function getWorkoutOverview(gymId: string, memberId: string): Promise<WorkoutOverview | null> {
  const [plan, timeZone] = await Promise.all([getWorkoutPlan(gymId, memberId), getGymTimezone(gymId)]);
  if (!plan) return null;

  const now = new Date();
  const weekStart = startOfZonedWeek(now, timeZone);
  const todayStart = startOfZonedDay(now, timeZone);

  // WorkoutCompletion has no gymId of its own; memberId is safe because
  // getWorkoutPlan already confirmed this member belongs to gymId.
  const completions = await db.workoutCompletion.findMany({
    where: {
      memberId,
      completedDate: { gte: weekStart },
      workoutPlanDayId: { in: plan.days.map((day) => day.id) },
    },
    select: { workoutPlanDayId: true, completedDate: true },
  });

  return {
    plan,
    todayDayOfWeek: zonedDayOfWeek(now, timeZone),
    doneThisWeek: new Set(completions.map((completion) => completion.workoutPlanDayId)),
    doneToday: new Set(
      completions
        .filter((completion) => completion.completedDate >= todayStart)
        .map((completion) => completion.workoutPlanDayId),
    ),
  };
}

async function assertDayInMembersPlan(gymId: string, memberId: string, workoutPlanDayId: string) {
  const plan = await getWorkoutPlan(gymId, memberId);
  if (!plan?.days.some((day) => day.id === workoutPlanDayId)) {
    throw new NotFoundError("Workout day");
  }
}

/**
 * Marks a plan day as done today. Safe to call twice (a double tap): the
 * second call finds today's completion and does nothing.
 */
export async function completeWorkoutDay(gymId: string, memberId: string, workoutPlanDayId: string) {
  await assertDayInMembersPlan(gymId, memberId, workoutPlanDayId);

  const todayStart = startOfZonedDay(new Date(), await getGymTimezone(gymId));
  const existing = await db.workoutCompletion.findFirst({
    where: { memberId, workoutPlanDayId, completedDate: { gte: todayStart } },
    select: { id: true },
  });
  if (existing) return;

  await db.workoutCompletion.create({ data: { memberId, workoutPlanDayId } });
}

/** Undoes today's tick for a plan day (a mis-tap). Earlier days are left alone. */
export async function undoWorkoutDay(gymId: string, memberId: string, workoutPlanDayId: string) {
  await assertDayInMembersPlan(gymId, memberId, workoutPlanDayId);

  const todayStart = startOfZonedDay(new Date(), await getGymTimezone(gymId));
  await db.workoutCompletion.deleteMany({
    where: { memberId, workoutPlanDayId, completedDate: { gte: todayStart } },
  });
}
