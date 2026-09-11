import { requireMemberSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { BmiCalculator } from "@/components/member/bmi-calculator";
import { PageHeader } from "@/components/shared/page-header";

export default async function BmiPage() {
  const session = await requireMemberSession();
  const member = await db.member.findUnique({
    where: { id: session.memberId },
    select: { heightCm: true },
  });

  return (
    <div>
      <PageHeader
        title="BMI calculator"
        description="A general fitness indicator, not a medical diagnosis."
      />
      <BmiCalculator defaultHeightCm={member?.heightCm} />
    </div>
  );
}
