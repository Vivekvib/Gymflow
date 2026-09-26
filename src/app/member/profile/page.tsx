import { requireMemberSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/member/profile-form";
import { ChangePasswordForm } from "@/components/member/change-password-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";

export default async function MemberProfilePage() {
  const session = await requireMemberSession();
  const member = await db.member.findUnique({ where: { id: session.memberId } });

  // Should be unreachable (the session was just issued for this member),
  // but fail safely rather than crash if the row ever went missing.
  if (!member) {
    return (
      <p className="text-sm text-[var(--color-ink-muted)]">We couldn&apos;t load your profile.</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description={`Member ID ${member.memberCode} - joined ${formatDate(member.joinDate)}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: member.name,
              phone: member.phone,
              email: member.email ?? undefined,
              gender: member.gender ?? undefined,
              dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toISOString().slice(0, 10) : undefined,
              heightCm: member.heightCm ?? undefined,
              emergencyContactName: member.emergencyContactName ?? undefined,
              emergencyContactPhone: member.emergencyContactPhone ?? undefined,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
