import { requireAdminSession } from "@/modules/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminWorkoutsPage() {
  await requireAdminSession();

  return (
    <div>
      <PageHeader
        title="Workout plans"
        description="Assign and manage member workout plans."
      />
      <EmptyState
        title="Workout plan management is next"
        description="The database schema (WorkoutPlan, WorkoutPlanDay, PlanExercise) already exists and is seeded with example data - this admin UI is scoped for the next implementation pass."
      />
    </div>
  );
}
