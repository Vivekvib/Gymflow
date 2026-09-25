import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAuditLog } from "@/lib/audit";
import { DB_TRANSACTION_OPTIONS } from "@/config/constants";
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
