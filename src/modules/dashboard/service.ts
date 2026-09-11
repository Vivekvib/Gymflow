import "server-only";
import { db } from "@/lib/db";
import { addDays } from "@/lib/dates";
import { DASHBOARD_EXPIRY_WINDOWS } from "@/config/constants";

type ExpiryWindow = (typeof DASHBOARD_EXPIRY_WINDOWS)[number];

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiringCounts: Record<ExpiryWindow, number>;
  paymentsTodayPaise: number;
  paymentsThisMonthPaise: number;
}

/**
 * A handful of independent aggregate queries, run in parallel with
 * Promise.all rather than fetched-then-computed-in-JS - each is a COUNT or
 * SUM that Postgres does far more cheaply than pulling every row over the
 * wire (see README's performance guidance).
 */
export async function getDashboardStats(gymId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalMembers, activeMembers, expiringCountsByWindow, paymentsToday, paymentsThisMonth] =
    await Promise.all([
      db.member.count({ where: { gymId } }),
      db.member.count({ where: { gymId, active: true, membershipEnd: { gt: now } } }),
      Promise.all(
        DASHBOARD_EXPIRY_WINDOWS.map((days) =>
          db.member.count({
            where: {
              gymId,
              active: true,
              membershipEnd: { gte: now, lte: addDays(now, days) },
            },
          }),
        ),
      ),
      db.payment.aggregate({
        where: { gymId, paymentDate: { gte: startOfToday } },
        _sum: { amountPaise: true },
      }),
      db.payment.aggregate({
        where: { gymId, paymentDate: { gte: startOfMonth } },
        _sum: { amountPaise: true },
      }),
    ]);

  const expiringCounts = Object.fromEntries(
    DASHBOARD_EXPIRY_WINDOWS.map((days, index) => [days, expiringCountsByWindow[index]]),
  ) as Record<ExpiryWindow, number>;

  return {
    totalMembers,
    activeMembers,
    expiringCounts,
    paymentsTodayPaise: paymentsToday._sum.amountPaise ?? 0,
    paymentsThisMonthPaise: paymentsThisMonth._sum.amountPaise ?? 0,
  };
}
