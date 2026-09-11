import { requireAdminSession } from "@/modules/auth/guards";
import { MemberForm } from "@/components/admin/member-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function NewMemberPage() {
  await requireAdminSession();

  return (
    <div>
      <PageHeader
        title="Add member"
        description="Create the member's profile, then record their first payment to activate membership."
      />
      <MemberForm mode="create" />
    </div>
  );
}
