import { notFound } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/guards";
import { getMemberDetail } from "@/modules/members/service";
import { MemberForm } from "@/components/admin/member-form";
import { PageHeader } from "@/components/shared/page-header";

interface EditMemberPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { memberId } = await params;
  const session = await requireAdminSession();
  const member = await getMemberDetail(session.gymId, memberId);

  if (!member) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${member.name}`} />
      <MemberForm
        mode="edit"
        memberId={member.id}
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
    </div>
  );
}
