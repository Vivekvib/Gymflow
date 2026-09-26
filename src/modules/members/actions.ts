"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, requireMemberSession } from "@/modules/auth/guards";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { NotFoundError } from "@/lib/errors";
import {
  changeMemberPassword,
  createMember,
  setMemberActive,
  updateMember,
  updateOwnProfile,
} from "@/modules/members/service";
import {
  changePasswordSchema,
  createMemberSchema,
  updateMemberSchema,
  type ChangePasswordInput,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "@/modules/members/validation";

export async function createMemberAction(
  input: CreateMemberInput,
): Promise<ActionResult<{ memberId: string }>> {
  const session = await requireAdminSession();

  const parsed = createMemberSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const member = await createMember(session.gymId, parsed.data, session.adminId);
    revalidatePath("/admin/members");
    revalidatePath("/admin");
    return actionSuccess({ memberId: member.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Failed to create member");
  }
}

export async function updateMemberAction(
  memberId: string,
  input: UpdateMemberInput,
): Promise<ActionResult<never>> {
  const session = await requireAdminSession();

  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await updateMember(session.gymId, memberId, parsed.data, session.adminId);
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Member not found.");
    return actionError(error instanceof Error ? error.message : "Failed to update member");
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
  redirect(`/admin/members/${memberId}`);
}

export async function setMemberActiveAction(
  memberId: string,
  active: boolean,
): Promise<ActionResult<never>> {
  const session = await requireAdminSession();

  try {
    await setMemberActive(session.gymId, memberId, active, session.adminId);
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Member not found.");
    return actionError(error instanceof Error ? error.message : "Failed to update member status");
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
  return actionSuccess();
}

export async function updateOwnProfileAction(
  input: UpdateMemberInput,
): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await updateOwnProfile(session.gymId, session.memberId, parsed.data);
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Profile not found.");
    return actionError(error instanceof Error ? error.message : "Failed to update profile");
  }

  // The member's name is also shown in the shared layout's header, so
  // "layout" revalidation is needed there, not just the profile page.
  revalidatePath("/member", "layout");
  return actionSuccess();
}

export async function changeMemberPasswordAction(
  input: ChangePasswordInput,
): Promise<ActionResult<never>> {
  const session = await requireMemberSession();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    await changeMemberPassword(
      session.gymId,
      session.memberId,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Profile not found.");
    return actionError(error instanceof Error ? error.message : "Failed to change password");
  }

  return actionSuccess();
}
