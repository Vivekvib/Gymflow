import Link from "next/link";
import { requireMemberSession } from "@/modules/auth/guards";
import { getMemberDetail, getMemberStatus } from "@/modules/members/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentHistory } from "@/components/admin/payment-history";
import { formatDate } from "@/lib/dates";
import { MEMBER_STATUS_LABEL, MEMBER_STATUS_TONE } from "@/modules/members/types";

export default async function MemberDashboardPage() {
  const session = await requireMemberSession();
  // A member's own detail is fetched with the exact same tenant-scoped
  // service used by the admin side - one code path, two callers.
  const member = await getMemberDetail(session.gymId, session.memberId);

  // Should be unreachable in practice (the session was just issued for this
  // member), but if the member row vanished between requests, fail safely
  // rather than crash the page.
  if (!member) {
    return <p className="text-sm text-[var(--color-ink-muted)]">We couldn&apos;t load your membership details.</p>;
  }

  const status = getMemberStatus(member);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Membership status</CardTitle>
          <Badge tone={MEMBER_STATUS_TONE[status]}>{MEMBER_STATUS_LABEL[status]}</Badge>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-[var(--color-ink-muted)]">
            Member ID <span className="font-medium text-[var(--color-ink)]">{member.memberCode}</span>
          </p>
          <p className="mt-1 text-[var(--color-ink-muted)]">
            {member.membershipEnd ? (
              <>
                Valid till{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {formatDate(member.membershipEnd)}
                </span>
              </>
            ) : (
              "No active membership yet - see the front desk to make your first payment."
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistory payments={member.payments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <Link href="/member/progress" className="font-medium text-[var(--color-accent)] hover:underline">
            Log weight &amp; track your goal
          </Link>
          <Link href="/member/workouts" className="font-medium text-[var(--color-accent)] hover:underline">
            View your workout plan
          </Link>
          <Link href="/member/bmi" className="font-medium text-[var(--color-accent)] hover:underline">
            BMI calculator
          </Link>
          <Link href="/member/profile" className="font-medium text-[var(--color-accent)] hover:underline">
            Edit profile &amp; password
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
