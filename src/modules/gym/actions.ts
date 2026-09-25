"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/modules/auth/guards";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { NotFoundError } from "@/lib/errors";
import { updateGym } from "@/modules/gym/service";
import { updateGymSchema, type UpdateGymInput } from "@/modules/gym/validation";

export async function updateGymAction(input: UpdateGymInput): Promise<ActionResult<never>> {
  const session = await requireAdminSession();

  const parsed = updateGymSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await updateGym(session.gymId, parsed.data, session.adminId);
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Gym not found.");
    return actionError(error instanceof Error ? error.message : "Failed to save settings");
  }

  // The gym name is shown in both the admin sidebar and the member header -
  // both live in layout.tsx files, so "layout" revalidation is needed to
  // refresh them, not just the settings page itself.
  revalidatePath("/admin", "layout");
  revalidatePath("/member", "layout");
  return actionSuccess();
}
