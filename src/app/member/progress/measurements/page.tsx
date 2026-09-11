import { requireMemberSession } from "@/modules/auth/guards";
import { MeasurementsForm } from "@/components/member/measurements-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function LogMeasurementsPage() {
  await requireMemberSession();

  return (
    <div>
      <PageHeader title="Log measurements" />
      <MeasurementsForm />
    </div>
  );
}
