import { requireMemberSession } from "@/modules/auth/guards";
import { getWorkoutPlan } from "@/modules/workouts/service";
import { DAY_OF_WEEK_OPTIONS } from "@/modules/workouts/validation";
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
                <ul className="space-y-2 text-sm">
                  {day.exercises.map((exercise) => (
                    <li
                      key={exercise.id}
                      className="flex items-center justify-between border-b border-[var(--color-line)] pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-medium text-[var(--color-ink)]">{exercise.name}</span>
                      <span className="text-[var(--color-ink-muted)]">
                        {exercise.sets} x {exercise.reps}
                        {exercise.restSeconds ? ` - ${exercise.restSeconds}s rest` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
