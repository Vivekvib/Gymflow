import Link from "next/link";
import { requireMemberSession } from "@/modules/auth/guards";
import { getProgressSummary } from "@/modules/progress/service";
import { ProgressSummary } from "@/components/member/progress-summary";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

export default async function MemberProgressPage() {
  const session = await requireMemberSession();
  const summary = await getProgressSummary(session.gymId, session.memberId);

  return (
    <div>
      <PageHeader
        title="Progress"
        description="Track your weight, BMI, and goal over time."
        actions={
          <>
            <Link
              href="/member/progress/weight"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Log weight
            </Link>
            <Link
              href="/member/progress/measurements"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Log measurements
            </Link>
            <Link href="/member/progress/goal" className={buttonVariants({ size: "sm" })}>
              Update goal
            </Link>
          </>
        }
      />
      <ProgressSummary summary={summary} />
    </div>
  );
}
