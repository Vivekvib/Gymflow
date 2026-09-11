"use server";

import { revalidatePath } from "next/cache";
import { requireMemberSession } from "@/modules/auth/guards";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { logMeasurements, logWeight, upsertGoal } from "@/modules/progress/service";
import {
  goalSchema,
  logMeasurementsSchema,
  logWeightSchema,
  type GoalInput,
  type LogMeasurementsInput,
  type LogWeightInput,
} from "@/modules/progress/validation";

export async function logWeightAction(input: LogWeightInput): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  const parsed = logWeightSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await logWeight(session.gymId, session.memberId, parsed.data);
  revalidatePath("/member/progress");
  revalidatePath("/member");
  return actionSuccess();
}

export async function logMeasurementsAction(
  input: LogMeasurementsInput,
): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  const parsed = logMeasurementsSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await logMeasurements(session.gymId, session.memberId, parsed.data);
  revalidatePath("/member/progress");
  return actionSuccess();
}

export async function upsertGoalAction(input: GoalInput): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await upsertGoal(session.gymId, session.memberId, parsed.data);
  revalidatePath("/member/progress");
  revalidatePath("/member");
  return actionSuccess();
}
