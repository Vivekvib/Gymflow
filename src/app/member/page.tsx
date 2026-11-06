import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { requireMemberSession } from "@/modules/auth/guards";
import { getMemberDetail, getMemberStatus } from "@/modules/members/service";
import { getGym } from "@/modules/gym/service";
import { getProgressSummary } from "@/modules/progress/service";
import { getWorkoutOverview } from "@/modules/workouts/service";
import { DAY_OF_WEEK_OPTIONS } from "@/modules/workouts/validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PaymentHistory } from "@/components/admin/payment-history";
import { MembershipRing } from "@/components/member/membership-ring";
import { formatDate, zonedDaysUntil } from "@/lib/dates";
import { toTelHref } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { getMemberStatusDisplay } from "@/modules/members/types";

export default async function MemberDashboardPage() {
  const session = await requireMemberSession();
  // A member's own detail is fetched with the exact same tenant-scoped
  // service used by the admin side - one code path, two callers.
  const [member, gym, workouts, progress] = await Promise.all([
    getMemberDetail(session.gymId, session.memberId),
    getGym(session.gymId),
    getWorkoutOverview(session.gymId, session.memberId),
    getProgressSummary(session.gymId, session.memberId),
  ]);

  // Should be unreachable in practice (the session was just issued for this
  // member), but if the member row vanished between requests, fail safely
  // rather than crash the page.
  if (!member) {
    return <p className="text-sm text-[var(--color-ink-muted)]">We couldn&apos;t load your membership details.</p>;
  }

  const statusDisplay = getMemberStatusDisplay(getMemberStatus(member), member.membershipEnd);
  const daysLeft = member.membershipEnd ? zonedDaysUntil(member.membershipEnd, gym?.timezone) : null;
  const planDays = member.payments[0]?.planDurationDays ?? 30;
  const needsRenewal = daysLeft === null || daysLeft <= 7;

  const todaysDay = workouts?.plan.days.find((day) => day.dayOfWeek === workouts.todayDayOfWeek);
  const doneThisWeek = workouts ? workouts.plan.days.filter((day) => workouts.doneThisWeek.has(day.id)).length : 0;

  // grid-cols-1 (minmax(0, 1fr)) so a wide child, like the payments table,
  // scrolls inside its card instead of stretching the page on a phone.
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Membership: the one thing the member opens this page to check. */}
      <Card className="lg:col-span-2">
        <CardContent className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:gap-10 sm:p-8">
          <MembershipRing daysLeft={daysLeft} planDays={planDays} />

          <div className="w-full min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-lg font-semibold text-[var(--color-ink)]">Your membership</h1>
              <Badge tone={statusDisplay.tone}>{statusDisplay.label}</Badge>
            </div>

            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              {member.membershipEnd ? (
                <>
                  {daysLeft !== null && daysLeft < 0 ? "Ended on" : "Valid till"}{" "}
                  <span className="font-medium text-[var(--color-ink)]">{formatDate(member.membershipEnd)}</span>
                </>
              ) : (
                "You haven't made your first payment yet."
              )}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Member ID <span className="font-medium text-[var(--color-ink)]">{member.memberCode}</span>
            </p>

            {needsRenewal ? (
              <div className="mt-5">
                <p className="text-sm text-[var(--color-ink)]">
                  {daysLeft === null
                    ? "Visit the front desk to start your membership."
                    : daysLeft < 0
                      ? "Renew at the front desk to start training again."
                      : "Renew at the front desk to keep your plan going."}
                </p>
                {gym?.phone ? (
                  <a
                    href={toTelHref(gym.phone)}
                    className={cn(buttonVariants({ variant: "secondary" }), "mt-3 h-11 w-full sm:w-auto")}
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    Call the front desk
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Today's workout */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Today&apos;s workout</CardTitle>
          {workouts ? (
            <span className="text-xs text-[var(--color-ink-muted)]">
              {doneThisWeek} of {workouts.plan.days.length} this week
            </span>
          ) : null}
        </CardHeader>
        <CardContent>
          {!workouts ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              You don&apos;t have a workout plan yet. Ask your trainer at the front desk.
            </p>
          ) : todaysDay ? (
            <>
              <p className="font-medium text-[var(--color-ink)]">{todaysDay.title}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {todaysDay.exercises.length} {todaysDay.exercises.length === 1 ? "exercise" : "exercises"}:{" "}
                {todaysDay.exercises
                  .slice(0, 3)
                  .map((exercise) => exercise.name)
                  .join(", ")}
                {todaysDay.exercises.length > 3 ? ` and ${todaysDay.exercises.length - 3} more` : ""}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href="/member/workouts" className={cn(buttonVariants(), "h-11 w-full sm:w-auto")}>
                  {workouts.doneToday.has(todaysDay.id) ? "View workout" : "Start workout"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                {workouts.doneToday.has(todaysDay.id) ? <Badge tone="success">Done today</Badge> : null}
              </div>
            </>
          ) : (
            <>
              <p className="font-medium text-[var(--color-ink)]">Rest day</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {(() => {
                  const next = [1, 2, 3, 4, 5, 6, 7]
                    .map((offset) => (workouts.todayDayOfWeek + offset) % 7)
                    .map((dow) => workouts.plan.days.find((day) => day.dayOfWeek === dow))
                    .find(Boolean);
                  return next
                    ? `Next up on ${DAY_OF_WEEK_OPTIONS.find((option) => option.value === next.dayOfWeek)?.label}: ${next.title}.`
                    : "Enjoy the recovery.";
                })()}
              </p>
              <Link
                href="/member/workouts"
                className="mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
              >
                See your week
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Your progress</CardTitle>
          <Link
            href="/member/progress"
            className="inline-flex min-h-8 items-center text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            See all
          </Link>
        </CardHeader>
        <CardContent>
          {progress.currentWeightKg === null ? (
            <>
              <p className="text-sm text-[var(--color-ink-muted)]">
                Log your weight to start tracking your progress.
              </p>
              <Link
                href="/member/progress/weight"
                className={cn(buttonVariants({ variant: "secondary" }), "mt-4 h-11 w-full sm:w-auto")}
              >
                Log your weight
              </Link>
            </>
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-[var(--color-ink-muted)]">Weight</dt>
                <dd className="mt-1 font-display text-3xl font-bold leading-none text-[var(--color-ink)]">
                  {progress.currentWeightKg}
                  <span className="ml-1 text-base font-normal text-[var(--color-ink-muted)]">kg</span>
                </dd>
                {progress.weightChangeKg !== null && progress.weightChangeKg !== 0 ? (
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    {progress.weightChangeKg > 0 ? "+" : ""}
                    {progress.weightChangeKg} kg since you started
                  </p>
                ) : null}
              </div>
              <div>
                <dt className="text-sm text-[var(--color-ink-muted)]">BMI</dt>
                <dd className="mt-1 font-display text-3xl font-bold leading-none text-[var(--color-ink)]">
                  {progress.currentBmi ?? "-"}
                </dd>
                {progress.bmiCategory ? (
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{progress.bmiCategory}</p>
                ) : null}
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistory
            payments={member.payments}
            emptyDescription="Your payments will show up here after you pay at the front desk."
          />
        </CardContent>
      </Card>
    </div>
  );
}
