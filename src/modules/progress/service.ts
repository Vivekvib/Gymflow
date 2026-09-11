import "server-only";
import { db } from "@/lib/db";
import { calculateBmi, categorizeBmi, roundBmi } from "@/modules/progress/bmi";
import type {
  GoalInput,
  LogMeasurementsInput,
  LogWeightInput,
} from "@/modules/progress/validation";
import type { ProgressSummary } from "@/modules/progress/types";

export async function logWeight(gymId: string, memberId: string, input: LogWeightInput) {
  return db.weightLog.create({
    data: {
      gymId,
      memberId,
      date: input.date ? new Date(input.date) : new Date(),
      weightKg: input.weightKg,
      notes: input.notes || undefined,
    },
  });
}

export async function logMeasurements(
  gymId: string,
  memberId: string,
  input: LogMeasurementsInput,
) {
  return db.measurementLog.create({
    data: {
      gymId,
      memberId,
      date: input.date ? new Date(input.date) : new Date(),
      waistCm: input.waistCm,
      chestCm: input.chestCm,
      hipCm: input.hipCm,
      armCm: input.armCm,
      thighCm: input.thighCm,
      notes: input.notes || undefined,
    },
  });
}

/**
 * One active goal per member (Goal.memberId is @unique on the schema) -
 * upsert rather than create, since "update my goal" is the common case
 * after the first save.
 */
export async function upsertGoal(gymId: string, memberId: string, input: GoalInput) {
  const targetDate = input.targetDate ? new Date(input.targetDate) : null;

  return db.goal.upsert({
    where: { memberId },
    update: {
      goalType: input.goalType,
      targetWeightKg: input.targetWeightKg,
      targetDate,
      notes: input.notes || null,
    },
    create: {
      gymId,
      memberId,
      goalType: input.goalType,
      targetWeightKg: input.targetWeightKg,
      targetDate: targetDate ?? undefined,
      notes: input.notes || undefined,
    },
  });
}

/**
 * Everything the member progress dashboard needs in one query set: BMI is
 * derived here (weight history + the member's stored height) rather than
 * stored anywhere, so it's always consistent with the latest weight log.
 */
export async function getProgressSummary(gymId: string, memberId: string): Promise<ProgressSummary> {
  const [member, weightLogs, goal] = await Promise.all([
    db.member.findFirst({ where: { id: memberId, gymId }, select: { heightCm: true } }),
    db.weightLog.findMany({ where: { gymId, memberId }, orderBy: { date: "asc" } }),
    db.goal.findUnique({ where: { memberId } }),
  ]);

  const firstLog = weightLogs[0];
  const lastLog = weightLogs[weightLogs.length - 1];
  const currentWeightKg = lastLog ? lastLog.weightKg : null;
  const startWeightKg = firstLog ? firstLog.weightKg : null;
  const weightChangeKg =
    currentWeightKg !== null && startWeightKg !== null
      ? Math.round((currentWeightKg - startWeightKg) * 10) / 10
      : null;

  let currentBmi: number | null = null;
  let bmiCategory: string | null = null;
  if (currentWeightKg !== null && member?.heightCm) {
    currentBmi = roundBmi(calculateBmi(currentWeightKg, member.heightCm));
    bmiCategory = categorizeBmi(currentBmi);
  }

  return {
    currentWeightKg,
    startWeightKg,
    weightChangeKg,
    currentBmi,
    bmiCategory,
    goal: goal
      ? {
          goalType: goal.goalType,
          targetWeightKg: goal.targetWeightKg,
          targetDate: goal.targetDate,
          notes: goal.notes,
        }
      : null,
    weightHistory: weightLogs.map((log) => ({ date: log.date, weightKg: log.weightKg })),
  };
}
