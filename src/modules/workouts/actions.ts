"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/modules/auth/guards";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { NotFoundError } from "@/lib/errors";
import { upsertWorkoutPlan } from "@/modules/workouts/service";
import { workoutPlanSchema, type WorkoutPlanInput } from "@/modules/workouts/validation";

export async function upsertWorkoutPlanAction(
  memberId: string,
  input: WorkoutPlanInput,
): Promise<ActionResult<never>> {
  const session = await requireAdminSession();

  const parsed = workoutPlanSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await upsertWorkoutPlan(session.gymId, memberId, parsed.data, session.adminId);
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Member not found.");
    return actionError(error instanceof Error ? error.message : "Failed to save workout plan");
  }

  revalidatePath(`/admin/workouts/${memberId}`);
  revalidatePath("/admin/workouts");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/member/workouts");
  return actionSuccess();
}
