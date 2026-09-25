import { notFound } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { getWorkoutPlan } from "@/modules/workouts/service";
import { WorkoutPlanForm } from "@/components/admin/workout-plan-form";
import { PageHeader } from "@/components/shared/page-header";
import type { WorkoutPlanInput } from "@/modules/workouts/validation";

interface AdminWorkoutPlanPageProps {
  params: Promise<{ memberId: string }>;
}

export default async function AdminWorkoutPlanPage({ params }: AdminWorkoutPlanPageProps) {
  const { memberId } = await params;
  const session = await requireAdminSession();

  const member = await db.member.findFirst({
    where: { id: memberId, gymId: session.gymId },
    select: { id: true, name: true, memberCode: true },
  });
  if (!member) notFound();

  const plan = await getWorkoutPlan(session.gymId, memberId);

  const defaultValues: WorkoutPlanInput | undefined = plan
    ? {
        title: plan.title,
        notes: plan.notes ?? "",
        days: plan.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          title: day.title,
          exercises: day.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds ?? undefined,
            notes: exercise.notes ?? "",
          })),
        })),
      }
    : undefined;

  return (
    <div>
      <PageHeader
        title={`Workout plan - ${member.name}`}
        description={member.memberCode}
      />
      <WorkoutPlanForm memberId={member.id} defaultValues={defaultValues} />
    </div>
  );
}
