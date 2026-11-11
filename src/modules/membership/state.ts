import { EXPIRING_SOON_DAYS } from "@/config/constants";
import { DEFAULT_TIMEZONE, startOfZonedDayOffset, zonedDaysUntil } from "@/lib/dates";

/**
 * The membership lifecycle, in one place.
 *
 *   NEW       joined, never paid          -> add a first payment
 *   ACTIVE    paid, more than a week left -> nothing to do
 *   EXPIRING  the last EXPIRING_SOON_DAYS days, including the last day itself -> renew
 *   EXPIRED   the last paid day has passed -> renew
 *   INACTIVE  switched off by an admin (wins over everything else) -> reactivate
 *
 * Nothing stores the state. It is derived from two columns on Member
 * (`active`, `membershipEnd`) plus "now", because a membership runs out with
 * no event to hang an update on. That is exactly why every screen, query and
 * integration must ask THIS module instead of re-deciding: the rule used to be
 * written out in half a dozen places and they disagreed.
 *
 * Rules that apply everywhere:
 *   - Days are the gym's own calendar days (IST), never the server's (UTC).
 *   - A membership paid through a date is valid for the WHOLE of that date.
 *     `membershipEnd` keeps the time of day the payment was taken, but the
 *     member is told "Valid till 19 Nov", so 19 Nov 8pm is still valid.
 *
 * This file has no database or server-only imports so it runs in tests and in
 * any component. The matching database filters are in ./query.ts, and
 * tests/integration/membership-parity.test.ts proves the two agree.
 */

export const MEMBERSHIP_STATES = ["ACTIVE", "EXPIRING", "EXPIRED", "NEW", "INACTIVE"] as const;
export type MembershipState = (typeof MEMBERSHIP_STATES)[number];

/** What the front desk (or the member) should do about this membership next. */
export type MembershipAction = "NONE" | "RENEW" | "ADD_PAYMENT" | "REACTIVATE";

export type MembershipTone = "success" | "warning" | "danger" | "neutral";

/**
 * How each state reads on screen. `satisfies Record<MembershipState, ...>`
 * makes adding a state a compile error here until it has wording, a colour
 * and a next action.
 */
export const MEMBERSHIP_DISPLAY = {
  ACTIVE: { label: "Active", tone: "success", action: "NONE" },
  EXPIRING: { label: "Expiring soon", tone: "warning", action: "RENEW" },
  EXPIRED: { label: "Expired", tone: "danger", action: "RENEW" },
  NEW: { label: "No plan yet", tone: "neutral", action: "ADD_PAYMENT" },
  INACTIVE: { label: "Inactive", tone: "neutral", action: "REACTIVATE" },
} as const satisfies Record<MembershipState, { label: string; tone: MembershipTone; action: MembershipAction }>;

/**
 * The values the admin members list accepts in `?status=`. These are the
 * URL vocabulary, so they must not be renamed. "Expired" there means "needs a
 * payment": it includes members who have never paid (state NEW).
 */
export const MEMBER_STATUS_FILTERS = ["ALL", "ACTIVE", "EXPIRING", "EXPIRED", "INACTIVE"] as const satisfies readonly (
  | "ALL"
  | MembershipState
)[];
export type MemberStatusFilter = (typeof MEMBER_STATUS_FILTERS)[number];

export interface MembershipInput {
  active: boolean;
  membershipEnd: Date | null;
}

export interface Membership {
  state: MembershipState;
  /**
   * Gym calendar days from today to the last paid day. 0 on the last day,
   * negative once it has passed, null if the member has never paid.
   */
  daysLeft: number | null;
  /** The first instant the membership is no longer valid (midnight after the last paid day); null if never paid. */
  validUntil: Date | null;
  /** May this member walk in right now? Active account and a paid day that has not passed. */
  canEnter: boolean;
  nextAction: MembershipAction;
}

export interface MembershipOptions {
  /** Defaults to the current time. Pass it to test a specific moment. */
  now?: Date;
  /** The gym's timezone (Gym.timezone). Defaults to India. */
  timeZone?: string;
}

export function getMembership(member: MembershipInput, options: MembershipOptions = {}): Membership {
  const now = options.now ?? new Date();
  const timeZone = options.timeZone ?? DEFAULT_TIMEZONE;
  const { membershipEnd } = member;

  const daysLeft = membershipEnd ? zonedDaysUntil(membershipEnd, timeZone, now) : null;
  const validUntil = membershipEnd ? startOfZonedDayOffset(membershipEnd, 1, timeZone) : null;
  const paidDayHasPassed = daysLeft !== null && daysLeft < 0;

  let state: MembershipState;
  if (!member.active) state = "INACTIVE";
  else if (daysLeft === null) state = "NEW";
  else if (paidDayHasPassed) state = "EXPIRED";
  else if (daysLeft <= EXPIRING_SOON_DAYS) state = "EXPIRING";
  else state = "ACTIVE";

  return {
    state,
    daysLeft,
    validUntil,
    canEnter: member.active && daysLeft !== null && !paidDayHasPassed,
    nextAction: MEMBERSHIP_DISPLAY[state].action,
  };
}

/** Label and colour for a state - the single place the wording lives. */
export function getMembershipDisplay(state: MembershipState): { label: string; tone: MembershipTone } {
  const { label, tone } = MEMBERSHIP_DISPLAY[state];
  return { label, tone };
}
