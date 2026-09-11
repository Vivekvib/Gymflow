import { notFound } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/guards";
import { getMemberDetail } from "@/modules/members/service";
import { MemberProfileCard } from "@/components/admin/member-profile";
import { PaymentHistory } from "@/components/admin/payment-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/dates";

interface MemberDetailPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { memberId } = await params;
  const session = await requireAdminSession();
  const member = await getMemberDetail(session.gymId, memberId);

  // Not found and "belongs to another gym" render identically - tenant
  // isolation must never be observable as a different error message.
  if (!member) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={member.name} description={`Member ${member.memberCode}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <MemberProfileCard member={member} />

          {member.goal ? (
            <Card>
              <CardHeader>
                <CardTitle>Goal</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium text-[var(--color-ink)]">
                  {member.goal.goalType}
                  {member.goal.targetWeightKg ? ` - target ${member.goal.targetWeightKg} kg` : ""}
                </p>
                {member.goal.targetDate ? (
                  <p className="text-[var(--color-ink-muted)]">By {formatDate(member.goal.targetDate)}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistory payments={member.payments} />
            </CardContent>
          </Card>

          {member.weightLogs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent weight logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {member.weightLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex justify-between border-b border-[var(--color-line)] pb-1 last:border-0"
                    >
                      <span className="text-[var(--color-ink-muted)]">{formatDate(log.date)}</span>
                      <span className="font-medium text-[var(--color-ink)]">{log.weightKg} kg</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
