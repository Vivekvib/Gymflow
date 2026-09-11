import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaise } from "@/lib/currency";
import type { DashboardStats } from "@/modules/dashboard/service";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total members" value={stats.totalMembers.toLocaleString("en-IN")} />
      <StatCard label="Active members" value={stats.activeMembers.toLocaleString("en-IN")} />
      <StatCard label="Payments today" value={formatPaise(stats.paymentsTodayPaise)} />
      <StatCard label="Payments this month" value={formatPaise(stats.paymentsThisMonthPaise)} />

      {([7, 15, 30] as const).map((window) => (
        <Card key={window}>
          <CardContent>
            <p className="text-sm text-[var(--color-ink-muted)]">Expiring in {window} days</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
              {stats.expiringCounts[window]}
            </p>
            <Link
              href={`/admin/members?status=EXPIRING`}
              className="mt-2 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              View members
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
      </CardContent>
    </Card>
  );
}
