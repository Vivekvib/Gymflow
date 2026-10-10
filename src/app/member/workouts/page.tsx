import { requireMemberSession } from "@/modules/auth/guards";
import { getWorkoutPlan } from "@/modules/workouts/service";
import { DAY_OF_WEEK_OPTIONS } from "@/modules/workouts/validation";
import { findExerciseVideoUrl } from "@/modules/workouts/exercise-library";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MemberWorkoutsPage() {
  const session = await requireMemberSession();
  const plan = await getWorkoutPlan(session.gymId, session.memberId);

  return (
    <div>
      <PageHeader title="Workout plan" />

      {!plan ? (
        <EmptyState
          title="No workout plan yet"
          description="Ask your trainer to assign you one from the front desk."
        />
      ) : (
        <div className="space-y-4">
          {plan.notes ? <p className="text-sm text-[var(--color-ink-muted)]">{plan.notes}</p> : null}
          {plan.days.map((day) => (
            <Card key={day.id}>
              <CardHeader>
                <CardTitle>
                  {DAY_OF_WEEK_OPTIONS.find((option) => option.value === day.dayOfWeek)?.label} -{" "}
                  {day.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {day.exercises.map((exercise) => {
                    // Resolved here on the server, so the exercise catalog is
                    // never sent to the member's browser.
                    const videoUrl = findExerciseVideoUrl(exercise.name);
                    return (
                      <li
                        key={exercise.id}
                        className="flex flex-col gap-1 border-b border-[var(--color-line)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-ink)]">{exercise.name}</p>
                          {videoUrl ? (
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex min-h-8 items-center text-xs font-medium text-[var(--color-accent)] hover:underline"
                            >
                              Watch video
                            </a>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-[var(--color-ink-muted)]">
                          {exercise.sets} x {exercise.reps}
                          {exercise.restSeconds ? `, ${exercise.restSeconds}s rest` : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
