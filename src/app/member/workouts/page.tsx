import { Check, Play } from "lucide-react";
import { requireMemberSession } from "@/modules/auth/guards";
import { getWorkoutOverview, type WorkoutOverview } from "@/modules/workouts/service";
import { DAY_OF_WEEK_OPTIONS } from "@/modules/workouts/validation";
import { findCatalogExerciseByName } from "@/modules/workouts/exercise-library";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutDayToggle } from "@/components/member/workout-day-toggle";
import { cn } from "@/lib/utils";

type PlanDay = WorkoutOverview["plan"]["days"][number];

/** Monday first, the way a gym week is read. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const SHORT_DAY: Record<number, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

function dayName(dayOfWeek: number): string {
  return DAY_OF_WEEK_OPTIONS.find((option) => option.value === dayOfWeek)?.label ?? "";
}

export default async function MemberWorkoutsPage() {
  const session = await requireMemberSession();
  const overview = await getWorkoutOverview(session.gymId, session.memberId);

  if (!overview) {
    return (
      <div>
        <PageHeader title="Workout plan" />
        <EmptyState
          title="No workout plan yet"
          description="Ask your trainer at the front desk to set one up for you."
        />
      </div>
    );
  }

  const { plan, todayDayOfWeek, doneThisWeek, doneToday } = overview;
  const todaysDay = plan.days.find((day) => day.dayOfWeek === todayDayOfWeek);
  const otherDays = plan.days.filter((day) => day !== todaysDay);

  // Next planned day after today, wrapping through the week, for the rest-day message.
  const nextDay = [1, 2, 3, 4, 5, 6, 7]
    .map((offset) => (todayDayOfWeek + offset) % 7)
    .map((dow) => plan.days.find((day) => day.dayOfWeek === dow))
    .find(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader title={plan.title} description={plan.notes ?? undefined} />

      <WeekStrip
        plan={plan}
        todayDayOfWeek={todayDayOfWeek}
        doneThisWeek={doneThisWeek}
        doneToday={doneToday}
      />

      {todaysDay ? (
        <WorkoutDayCard day={todaysDay} isToday done={doneToday.has(todaysDay.id)} />
      ) : (
        <Card>
          <CardContent className="p-5">
            <p className="font-medium text-[var(--color-ink)]">Rest day today</p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {nextDay ? `Your next workout is ${dayName(nextDay.dayOfWeek)}: ${nextDay.title}.` : "Enjoy the recovery."}
            </p>
          </CardContent>
        </Card>
      )}

      {otherDays.length > 0 ? (
        <section aria-labelledby="rest-of-week">
          <h2 id="rest-of-week" className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            {todaysDay ? "Rest of your week" : "Your week"}
          </h2>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {otherDays.map((day) => (
              <WorkoutDayCard
                key={day.id}
                day={day}
                isToday={false}
                done={doneThisWeek.has(day.id)}
                doneToday={doneToday.has(day.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function WeekStrip({ plan, todayDayOfWeek, doneThisWeek, doneToday }: WorkoutOverview) {
  const planned = plan.days.length;
  const done = plan.days.filter((day) => doneThisWeek.has(day.id)).length;

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--color-ink)]">This week</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">{done}</span> of {planned}{" "}
            {planned === 1 ? "workout" : "workouts"} done
          </p>
        </div>

        <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Your week">
          {WEEK_ORDER.map((dow) => {
            const day = plan.days.find((planDay) => planDay.dayOfWeek === dow);
            const isDone = day ? doneThisWeek.has(day.id) : false;
            const isToday = dow === todayDayOfWeek;
            const label = `${dayName(dow)}: ${day ? (isDone ? "done" : "workout planned") : "rest"}${isToday ? ", today" : ""}`;

            return (
              <li key={dow} aria-label={label} className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "text-xs",
                    isToday ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]",
                  )}
                >
                  {SHORT_DAY[dow]}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex h-9 w-full max-w-11 items-center justify-center rounded-md border text-xs",
                    isDone || (day && doneToday.has(day.id))
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                      : day
                        ? "border-[var(--color-line-strong)] text-[var(--color-ink)]"
                        : "border-[var(--color-line)] text-[var(--color-ink-muted)]",
                    isToday && "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-surface)]",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : day ? "" : "-"}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function WorkoutDayCard({
  day,
  isToday,
  done,
  doneToday = done,
}: {
  day: PlanDay;
  isToday: boolean;
  /** Done at some point this week. */
  done: boolean;
  /** Done today - this is what the button reflects, since a tick is per day. */
  doneToday?: boolean;
}) {
  return (
    <Card className={cn(isToday && "border-[var(--color-accent)]")}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-ink-muted)]">{dayName(day.dayOfWeek)}</p>
          <CardTitle className="mt-0.5 text-base">{day.title}</CardTitle>
        </div>
        {isToday ? (
          <Badge className="shrink-0 bg-[var(--color-accent)] text-[var(--color-accent-ink)]">Today</Badge>
        ) : done ? (
          <Badge tone="success" className="shrink-0">
            Done this week
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3 text-sm">
          {day.exercises.map((exercise) => {
            // Looked up here on the server, so the exercise catalog is never
            // sent to the member's browser.
            const catalogEntry = findCatalogExerciseByName(exercise.name);
            const videoUrl = catalogEntry?.videoUrl ?? null;
            return (
              <li
                key={exercise.id}
                className="flex flex-col gap-2 border-b border-[var(--color-line)] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-ink)]">{exercise.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                    {catalogEntry ? <span>{catalogEntry.muscleGroup}</span> : null}
                    {videoUrl ? (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-8 items-center gap-1 font-medium text-[var(--color-accent)] hover:underline"
                      >
                        <Play className="h-3 w-3" aria-hidden />
                        Watch demo
                      </a>
                    ) : null}
                  </div>
                </div>
                <p className="shrink-0 text-[var(--color-ink)] tabular-nums">
                  {exercise.sets} &times; {exercise.reps}
                  {exercise.restSeconds ? (
                    <span className="text-[var(--color-ink-muted)]">, {exercise.restSeconds}s rest</span>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>

        <WorkoutDayToggle workoutPlanDayId={day.id} doneToday={doneToday} emphasis={isToday} />
      </CardContent>
    </Card>
  );
}
