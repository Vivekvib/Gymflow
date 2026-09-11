import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { getMemberStatus } from "@/modules/members/service";
import { MEMBER_STATUS_LABEL, MEMBER_STATUS_TONE } from "@/modules/members/types";
import { setMemberActiveAction } from "@/modules/members/actions";
import type { Member } from "@/generated/prisma/client";

async function toggleMemberActive(memberId: string, active: boolean): Promise<void> {
  "use server";
  await setMemberActiveAction(memberId, active);
}

export function MemberProfileCard({ member }: { member: Member }) {
  const status = getMemberStatus(member);
  // Binding args onto the Server Action lets a plain <form> submit it
  // without a client component - see Next.js Server Actions docs on
  // passing extra arguments via `.bind()`. The wrapper discards the
  // ActionResult because a plain (non-useActionState) form's `action`
  // prop requires a function returning void/Promise<void>.
  const toggleActive = toggleMemberActive.bind(null, member.id, !member.active);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{member.name}</CardTitle>
        <Badge tone={MEMBER_STATUS_TONE[status]}>{MEMBER_STATUS_LABEL[status]}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Member ID" value={member.memberCode} />
        <Row label="Phone" value={member.phone} />
        <Row label="Email" value={member.email ?? "-"} />
        <Row label="Joined" value={formatDate(member.joinDate)} />
        <Row
          label="Valid till"
          value={member.membershipEnd ? formatDate(member.membershipEnd) : "No membership yet"}
        />
        <Row label="Height" value={member.heightCm ? `${member.heightCm} cm` : "-"} />
        <Row
          label="Emergency contact"
          value={
            member.emergencyContactName
              ? `${member.emergencyContactName} (${member.emergencyContactPhone ?? "-"})`
              : "-"
          }
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={`/admin/members/${member.id}/edit`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Edit
          </Link>
          <Link
            href={`/admin/payments/new?memberId=${member.id}`}
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Record payment
          </Link>
          <form action={toggleActive}>
            <Button variant={member.active ? "danger" : "secondary"} size="sm" type="submit">
              {member.active ? "Deactivate" : "Reactivate"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-line)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <span className="font-medium text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
