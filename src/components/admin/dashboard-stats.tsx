import { Card, CardContent } from "@/components/ui/card";
import { formatPaise } from "@/lib/currency";
import type { DashboardStats } from "@/modules/dashboard/service";

interface DashboardStatsProps {
  stats: DashboardStats;
}

/**
 * The figures an owner checks first. Money gets the large treatment (it's
 * the number that matters most at a glance); the three counts sit beside it
 * on a laptop and under it on smaller screens, always in one row of three so
 * no tile is left on a line by itself.
 */
export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.4fr_2fr]">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-[var(--color-ink-muted)]">Collected this month</p>
          <p className="mt-2 font-display text-4xl font-bold leading-none tracking-tight text-[var(--color-ink)] sm:text-5xl">
            {formatPaise(stats.paymentsThisMonthPaise)}
          </p>
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
            {stats.paymentsLastMonthPaise > 0
              ? `${formatPaise(stats.paymentsLastMonthPaise)} collected last month`
              : "Nothing collected last month"}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile label="Collected today" value={formatPaise(stats.paymentsTodayPaise)} />
        <StatTile
          label="Active members"
          value={stats.activeMembers.toLocaleString("en-IN")}
          hint={`of ${stats.totalMembers.toLocaleString("en-IN")} total`}
        />
        <StatTile
          label="New this month"
          value={stats.newMembersThisMonth.toLocaleString("en-IN")}
          hint={stats.newMembersThisMonth === 1 ? "member joined" : "members joined"}
        />
      </div>
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex h-full min-w-0 flex-col p-3 sm:p-5">
        <p className="text-xs text-[var(--color-ink-muted)] sm:text-sm">{label}</p>
        <p className="mt-2 break-words font-display text-xl font-bold leading-none text-[var(--color-ink)] sm:text-3xl">
          {value}
        </p>
        {hint ? <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
