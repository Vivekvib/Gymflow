import { cn } from "@/lib/utils";

interface MembershipRingProps {
  /** Calendar days left; negative when lapsed; null when no membership has been paid for yet. */
  daysLeft: number | null;
  /** Length of the most recent plan, so the ring shows how much of it is left. */
  planDays: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The member's one number: how many days they have left. The arc empties as
 * the plan runs down and changes colour in the last week, so it reads at a
 * glance without anyone having to find an expiry date.
 */
export function MembershipRing({ daysLeft, planDays }: MembershipRingProps) {
  const hasMembership = daysLeft !== null;
  const lapsed = hasMembership && daysLeft < 0;
  const endingSoon = hasMembership && daysLeft >= 0 && daysLeft <= 7;

  const fraction = hasMembership && !lapsed ? Math.min(1, Math.max(0, daysLeft / Math.max(planDays, 1))) : 0;
  const arcColor = lapsed
    ? "var(--color-danger)"
    : endingSoon
      ? "var(--color-warn)"
      : "var(--color-accent)";

  const centreNumber = !hasMembership ? "-" : lapsed ? String(Math.abs(daysLeft)) : String(daysLeft);
  const centreLabel = !hasMembership
    ? "no plan yet"
    : lapsed
      ? Math.abs(daysLeft) === 1
        ? "day ago"
        : "days ago"
      : daysLeft === 1
        ? "day left"
        : "days left";

  const description = !hasMembership
    ? "No membership has been paid for yet."
    : lapsed
      ? `Membership ended ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "day" : "days"} ago.`
      : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left on your membership.`;

  return (
    <div className="relative mx-auto h-44 w-44 shrink-0 sm:h-48 sm:w-48" role="img" aria-label={description}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--color-subtle)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke={arcColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span
          className={cn(
            "font-display text-6xl font-bold leading-none tabular-nums",
            lapsed ? "text-[var(--color-danger)]" : endingSoon ? "text-[var(--color-warn)]" : "text-[var(--color-ink)]",
          )}
        >
          {centreNumber}
        </span>
        <span className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{centreLabel}</span>
      </div>
    </div>
  );
}
