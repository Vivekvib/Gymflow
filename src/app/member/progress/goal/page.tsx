import { requireMemberSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { GoalForm } from "@/components/member/goal-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function GoalPage() {
  const session = await requireMemberSession();
  const goal = await db.goal.findUnique({ where: { memberId: session.memberId } });

  return (
    <div>
      <PageHeader title="Goal" description="Set what you're working towards." />
      <GoalForm
        defaultValues={
          goal
            ? {
                goalType: goal.goalType,
                targetWeightKg: goal.targetWeightKg ?? undefined,
                targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : undefined,
                notes: goal.notes ?? undefined,
              }
            : undefined
        }
      />
    </div>
  );
}
