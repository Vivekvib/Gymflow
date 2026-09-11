import { requireMemberSession } from "@/modules/auth/guards";
import { WeightForm } from "@/components/member/weight-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function LogWeightPage() {
  await requireMemberSession();

  return (
    <div>
      <PageHeader title="Log weight" />
      <WeightForm />
    </div>
  );
}
