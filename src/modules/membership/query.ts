import type { Prisma } from "@/generated/prisma/client";
import { EXPIRING_SOON_DAYS, RENEWAL_LAPSED_LOOKBACK_DAYS } from "@/config/constants";
import { DEFAULT_TIMEZONE, startOfZonedDay, startOfZonedDayOffset } from "@/lib/dates";
import type { MemberStatusFilter } from "@/modules/membership/state";

/**
 * The database side of modules/membership/state.ts: the same rules, written
 * as `where` clauses so lists and counts are computed by Postgres.
 *
 * Everything is built from gym-day boundaries, mirroring `daysLeft`:
 *   daysLeft >= 0   <=>  membershipEnd >= start of today
 *   daysLeft <= N   <=>  membershipEnd <  start of the day N + 1 days from today
 *   daysLeft >= -N  <=>  membershipEnd >= start of the day N days ago
 * tests/integration/membership-parity.test.ts checks these against
 * getMembership() for the same members at several moments of the day, so the
 * two cannot drift apart without a failing test.
 */

export interface MembershipQueryOptions {
  now?: Date;
  timeZone?: string;
}

function resolve(options: MembershipQueryOptions) {
  return { now: options.now ?? new Date(), timeZone: options.timeZone ?? DEFAULT_TIMEZONE };
}

/** `membershipEnd` filter for members whose last paid day is within the next `days` days (today included). */
export function endsWithinDays(days: number, options: MembershipQueryOptions = {}): Prisma.DateTimeNullableFilter {
  const { now, timeZone } = resolve(options);
  return { gte: startOfZonedDay(now, timeZone), lt: startOfZonedDayOffset(now, days + 1, timeZone) };
}

/**
 * Everyone who may walk in today: an active account whose last paid day has
 * not passed. ACTIVE plus EXPIRING. This is the dashboard's "current
 * members" and what a door or fingerprint integration should read.
 */
export function canEnterWhere(options: MembershipQueryOptions = {}): Prisma.MemberWhereInput {
  const { now, timeZone } = resolve(options);
  return { active: true, membershipEnd: { gte: startOfZonedDay(now, timeZone) } };
}

/**
 * Who the front desk should talk to: active members in their last
 * EXPIRING_SOON_DAYS days, or lapsed within the last RENEWAL_LAPSED_LOOKBACK_DAYS.
 */
export function renewalsDueWhere(options: MembershipQueryOptions = {}): Prisma.MemberWhereInput {
  const { now, timeZone } = resolve(options);
  return {
    active: true,
    membershipEnd: {
      gte: startOfZonedDayOffset(now, -RENEWAL_LAPSED_LOOKBACK_DAYS, timeZone),
      lt: startOfZonedDayOffset(now, EXPIRING_SOON_DAYS + 1, timeZone),
    },
  };
}

/**
 * The members-list status filter. `withinDays` only widens or narrows the
 * EXPIRING filter (the dashboard's 7 / 15 / 30 day links); it is ignored for
 * every other status, so `?status=ACTIVE&within=7` means the same as
 * `?status=ACTIVE`.
 *
 * "EXPIRED" is "needs a payment": lapsed members AND members who never paid,
 * matching what the filter has always shown.
 */
export function membershipWhere(
  filter: MemberStatusFilter,
  options: MembershipQueryOptions & { withinDays?: number } = {},
): Prisma.MemberWhereInput | null {
  const { now, timeZone } = resolve(options);

  switch (filter) {
    case "INACTIVE":
      return { active: false };
    case "EXPIRED":
      return {
        active: true,
        OR: [{ membershipEnd: null }, { membershipEnd: { lt: startOfZonedDay(now, timeZone) } }],
      };
    case "EXPIRING":
      return { active: true, membershipEnd: endsWithinDays(options.withinDays ?? EXPIRING_SOON_DAYS, { now, timeZone }) };
    case "ACTIVE":
      return {
        active: true,
        membershipEnd: { gte: startOfZonedDayOffset(now, EXPIRING_SOON_DAYS + 1, timeZone) },
      };
    case "ALL":
      return null;
  }
}
