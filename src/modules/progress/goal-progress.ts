import type { GoalType } from "@/generated/prisma/client";

/**
 * Percentage of the way from a member's first logged weight to their
 * goal's target weight, clamped to [0, 100]. Returns null when there isn't
 * enough data to compute a meaningful number - no goal, no weight history,
 * a MAINTAIN/FITNESS goal (neither is about hitting a target weight), or a
 * target that isn't actually in the claimed direction (e.g. a "LOSE" goal
 * with a target heavier than the starting weight).
 */
export function calculateGoalProgressPercent(
  goalType: GoalType,
  startWeightKg: number | null,
  currentWeightKg: number | null,
  targetWeightKg: number | null,
): number | null {
  if (startWeightKg === null || currentWeightKg === null || targetWeightKg === null) return null;
  if (goalType !== "LOSE" && goalType !== "GAIN") return null;

  const totalDistance =
    goalType === "LOSE" ? startWeightKg - targetWeightKg : targetWeightKg - startWeightKg;
  if (totalDistance <= 0) return null;

  const progressDistance =
    goalType === "LOSE" ? startWeightKg - currentWeightKg : currentWeightKg - startWeightKg;

  const percent = (progressDistance / totalDistance) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}
