import Link from "next/link";
import { requireAdminSession } from "@/modules/auth/guards";
import { getDashboardStats, getRenewalsDue, getRevenueByMonth } from "@/modules/dashboard/service";
import { getGym } from "@/modules/gym/service";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats";
import { RenewalsDue } from "@/components/admin/renewals-due";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const [stats, renewals, revenue, gym] = await Promise.all([
    getDashboardStats(session.gymId),
    getRenewalsDue(session.gymId),
    getRevenueByMonth(session.gymId, 6),
    getGym(session.gymId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Who needs to renew, and what came in."
        actions={
          <>
            <Link
              href="/admin/members/new"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Add member
            </Link>
            <Link href="/admin/payments/new" className={buttonVariants({ size: "sm" })}>
              Record payment
            </Link>
          </>
        }
      />

      <DashboardStatsGrid stats={stats} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RenewalsDue
          items={renewals.items}
          total={renewals.total}
          gymName={gym?.name ?? "the gym"}
          expiringCounts={stats.expiringCounts}
        />
        <RevenueChart data={revenue} />
      </div>
    </div>
  );
}
