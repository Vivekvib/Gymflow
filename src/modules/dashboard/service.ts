import "server-only";
import { db } from "@/lib/db";
import {
  addDays,
  zonedDaysUntil,
  lastMonthStarts,
  startOfZonedDay,
  startOfZonedMonth,
} from "@/lib/dates";
import { DASHBOARD_EXPIRY_WINDOWS } from "@/config/constants";
import { getGymTimezone } from "@/modules/gym/service";
import { canEnterWhere, endsWithinDays, renewalsDueWhere } from "@/modules/membership/query";

type ExpiryWindow = (typeof DASHBOARD_EXPIRY_WINDOWS)[number];

export interface DashboardStats {
  totalMembers: number;
  /** Members who may walk in today: active account, last paid day not yet passed. */
  currentMembers: number;
  newMembersThisMonth: number;
  expiringCounts: Record<ExpiryWindow, number>;
  paymentsTodayPaise: number;
  paymentsThisMonthPaise: number;
  paymentsLastMonthPaise: number;
}

export interface RenewalDue {
  id: string;
  name: string;
  memberCode: string;
  phone: string;
  membershipEnd: Date;
  /** Calendar days until expiry; negative once the membership has lapsed. */
  daysLeft: number;
}

export interface RevenuePoint {
  key: string;
  label: string;
  totalPaise: number;
  paymentCount: number;
}

/**
 * A handful of independent aggregate queries, run in parallel with
 * Promise.all rather than fetched-then-computed-in-JS - each is a COUNT or
 * SUM that Postgres does far more cheaply than pulling every row over the
 * wire (see README's performance guidance).
 *
 * "Today" and "this month" are the gym's own (IST) day and month, not the
 * server's (UTC) - see the gym-timezone helpers in lib/dates.ts.
 *
 * Only successful payments are summed: a failed, pending or refunded
 * payment is not revenue.
 */
export async function getDashboardStats(gymId: string): Promise<DashboardStats> {
  const timeZone = await getGymTimezone(gymId);
  const now = new Date();
  const startOfToday = startOfZonedDay(now, timeZone);
  const startOfMonth = startOfZonedMonth(now, timeZone);
  const startOfLastMonth = startOfZonedMonth(addDays(startOfMonth, -1), timeZone);

  const [
    totalMembers,
    currentMembers,
    newMembersThisMonth,
    expiringCountsByWindow,
    paymentsToday,
    paymentsThisMonth,
    paymentsLastMonth,
  ] = await Promise.all([
    db.member.count({ where: { gymId } }),
    db.member.count({ where: { gymId, ...canEnterWhere({ now, timeZone }) } }),
    db.member.count({ where: { gymId, joinDate: { gte: startOfMonth } } }),
    Promise.all(
      DASHBOARD_EXPIRY_WINDOWS.map((days) =>
        db.member.count({
          where: { gymId, active: true, membershipEnd: endsWithinDays(days, { now, timeZone }) },
        }),
      ),
    ),
    db.payment.aggregate({
      where: { gymId, status: "SUCCESS", paymentDate: { gte: startOfToday } },
      _sum: { amountPaise: true },
    }),
    db.payment.aggregate({
      where: { gymId, status: "SUCCESS", paymentDate: { gte: startOfMonth } },
      _sum: { amountPaise: true },
    }),
    db.payment.aggregate({
      where: { gymId, status: "SUCCESS", paymentDate: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amountPaise: true },
    }),
  ]);

  const expiringCounts = Object.fromEntries(
    DASHBOARD_EXPIRY_WINDOWS.map((days, index) => [days, expiringCountsByWindow[index]]),
  ) as Record<ExpiryWindow, number>;

  return {
    totalMembers,
    currentMembers,
    newMembersThisMonth,
    expiringCounts,
    paymentsTodayPaise: paymentsToday._sum.amountPaise ?? 0,
    paymentsThisMonthPaise: paymentsThisMonth._sum.amountPaise ?? 0,
    paymentsLastMonthPaise: paymentsLastMonth._sum.amountPaise ?? 0,
  };
}

/**
 * Who the front desk should talk to: active members in their last
 * EXPIRING_SOON_DAYS days, or lapsed within the last RENEWAL_LAPSED_LOOKBACK_DAYS
 * (see config/constants.ts). Soonest first, so the most urgent are at the top
 * and recently lapsed members sit alongside them. Members who never paid at
 * all are not listed - they're new sign-ups, not renewals.
 */
export async function getRenewalsDue(
  gymId: string,
  limit = 8,
): Promise<{ items: RenewalDue[]; total: number }> {
  const timeZone = await getGymTimezone(gymId);
  const now = new Date();
  const where = { gymId, ...renewalsDueWhere({ now, timeZone }) };

  const [rows, total] = await Promise.all([
    db.member.findMany({
      where,
      select: { id: true, name: true, memberCode: true, phone: true, membershipEnd: true },
      orderBy: { membershipEnd: "asc" },
      take: limit,
    }),
    db.member.count({ where }),
  ]);

  const items = rows.flatMap((row) =>
    row.membershipEnd
      ? [{ ...row, membershipEnd: row.membershipEnd, daysLeft: zonedDaysUntil(row.membershipEnd, timeZone, now) }]
      : [],
  );

  return { items, total };
}

/** Successful payments per month for the last `months` months, oldest first. */
export async function getRevenueByMonth(gymId: string, months = 6): Promise<RevenuePoint[]> {
  const timeZone = await getGymTimezone(gymId);
  const buckets = lastMonthStarts(new Date(), months, timeZone);
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  if (!first || !last) return [];
  const rangeStart = first.start;
  const rangeEnd = last.end;

  const payments = await db.payment.findMany({
    where: { gymId, status: "SUCCESS", paymentDate: { gte: rangeStart, lt: rangeEnd } },
    select: { paymentDate: true, amountPaise: true },
  });

  const points: RevenuePoint[] = buckets.map(({ key, label }) => ({
    key,
    label,
    totalPaise: 0,
    paymentCount: 0,
  }));

  for (const payment of payments) {
    const index = buckets.findIndex(
      (bucket) => payment.paymentDate >= bucket.start && payment.paymentDate < bucket.end,
    );
    const point = points[index];
    if (point) {
      point.totalPaise += payment.amountPaise;
      point.paymentCount += 1;
    }
  }

  return points;
}
