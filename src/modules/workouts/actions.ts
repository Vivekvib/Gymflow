"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession, requireMemberSession } from "@/modules/auth/guards";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { NotFoundError } from "@/lib/errors";
import { completeWorkoutDay, undoWorkoutDay, upsertWorkoutPlan } from "@/modules/workouts/service";
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

/**
 * Member ticks a day of their plan off (or undoes a mis-tap). The member and
 * gym always come from the session, never from the client.
 */
export async function setWorkoutDayDoneAction(
  workoutPlanDayId: string,
  done: boolean,
): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  if (typeof workoutPlanDayId !== "string" || workoutPlanDayId.length === 0) {
    return actionError("Choose a workout day.");
  }

  try {
    if (done) {
      await completeWorkoutDay(session.gymId, session.memberId, workoutPlanDayId);
    } else {
      await undoWorkoutDay(session.gymId, session.memberId, workoutPlanDayId);
    }
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("That workout isn't in your plan.");
    return actionError("Couldn't save that. Try again.");
  }

  revalidatePath("/member/workouts");
  revalidatePath("/member");
  return actionSuccess();
}
