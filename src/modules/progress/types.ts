import type { GoalType } from "@/generated/prisma/client";

export interface ProgressGoalSummary {
  goalType: GoalType;
  targetWeightKg: number | null;
  targetDate: Date | null;
  notes: string | null;
}

export interface ProgressSummary {
  currentWeightKg: number | null;
  startWeightKg: number | null;
  weightChangeKg: number | null;
  currentBmi: number | null;
  bmiCategory: string | null;
  goal: ProgressGoalSummary | null;
  weightHistory: { date: Date; weightKg: number }[];
}
