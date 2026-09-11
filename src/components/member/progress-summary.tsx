import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightChart } from "@/components/member/weight-chart";
import { formatDate } from "@/lib/dates";
import { calculateGoalProgressPercent } from "@/modules/progress/goal-progress";
import type { ProgressSummary as ProgressSummaryData } from "@/modules/progress/types";
import type { GoalType } from "@/generated/prisma/client";

const GOAL_LABEL: Record<GoalType, string> = {
  LOSE: "Lose weight",
  GAIN: "Gain weight",
  MAINTAIN: "Maintain weight",
  FITNESS: "General fitness",
};

export function ProgressSummary({ summary }: { summary: ProgressSummaryData }) {
  const progressPercent = summary.goal
    ? calculateGoalProgressPercent(
        summary.goal.goalType,
        summary.startWeightKg,
        summary.currentWeightKg,
        summary.goal.targetWeightKg,
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--color-ink-muted)]">Current weight</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
              {summary.currentWeightKg !== null ? `${summary.currentWeightKg} kg` : "Not logged yet"}
            </p>
            {summary.weightChangeKg !== null ? (
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                {summary.weightChangeKg > 0 ? "+" : ""}
                {summary.weightChangeKg} kg since your first log
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-[var(--color-ink-muted)]">BMI</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
              {summary.currentBmi ?? "-"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              {summary.currentBmi
                ? summary.bmiCategory
                : "Add your height in your profile and log a weight"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className="text-sm text-[var(--color-ink-muted)]">Goal</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
              {summary.goal ? GOAL_LABEL[summary.goal.goalType] : "No goal set yet"}
            </p>
            {summary.goal?.targetWeightKg ? (
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Target {summary.goal.targetWeightKg} kg
                {summary.goal.targetDate ? ` by ${formatDate(summary.goal.targetDate)}` : ""}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {progressPercent !== null ? (
        <Card>
          <CardHeader>
            <CardTitle>Goal progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              {progressPercent}% of the way there
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Weight over time</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={summary.weightHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
