import Link from "next/link";
import { requireAdminSession } from "@/modules/auth/guards";
import { getDashboardStats } from "@/modules/dashboard/service";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const stats = await getDashboardStats(session.gymId);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A snapshot of members, payments, and upcoming renewals."
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
    </div>
  );
}
