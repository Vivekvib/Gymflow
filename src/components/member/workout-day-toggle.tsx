"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { setWorkoutDayDoneAction } from "@/modules/workouts/actions";
import { cn } from "@/lib/utils";

interface WorkoutDayToggleProps {
  workoutPlanDayId: string;
  doneToday: boolean;
  /** Primary styling for today's workout; quieter for the other days. */
  emphasis?: boolean;
}

/**
 * One button that both marks a day done and undoes it. The tick shows
 * immediately and rolls back with a message if the save fails.
 */
export function WorkoutDayToggle({ workoutPlanDayId, doneToday, emphasis = false }: WorkoutDayToggleProps) {
  const [optimisticDone, setOptimisticDone] = React.useOptimistic(doneToday);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const toggle = () => {
    setError(null);
    const next = !optimisticDone;
    startTransition(async () => {
      setOptimisticDone(next);
      const result = await setWorkoutDayDoneAction(workoutPlanDayId, next);
      if (!result.success) setError(result.error ?? "Couldn't save that. Try again.");
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={optimisticDone}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium transition-colors disabled:opacity-70 sm:w-auto",
          optimisticDone
            ? "border border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]"
            : emphasis
              ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:brightness-95"
              : "border border-[var(--color-line-strong)] text-[var(--color-ink)] hover:bg-[var(--color-subtle)]",
        )}
      >
        {optimisticDone ? <Check className="h-4 w-4" aria-hidden /> : null}
        {optimisticDone ? "Done today" : "Mark as done"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
