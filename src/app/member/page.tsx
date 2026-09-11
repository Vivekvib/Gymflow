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
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Progress &amp; BMI</CardTitle>
          <div className="flex gap-2">
            <Link
              href="/member/progress"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              View progress
            </Link>
            <Link
              href="/member/bmi"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              BMI calculator
            </Link>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-ink-muted)]">
          Log your weight, track your goal, and check your BMI.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-ink-muted)]">
          Workout plans and profile editing are modeled in the database already and are the next
          slice of work - they are not yet wired up to a page here.
        </CardContent>
      </Card>
    </div>
  );
}
