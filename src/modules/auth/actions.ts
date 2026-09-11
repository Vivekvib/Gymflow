"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordAuditLog } from "@/lib/audit";
import { verifyPassword } from "@/modules/auth/password";
import {
  clearAdminSession,
  clearMemberSession,
  createAdminSession,
  createMemberSession,
} from "@/modules/auth/session";
import {
  adminLoginSchema,
  memberLoginSchema,
  type AdminLoginInput,
  type MemberLoginInput,
} from "@/modules/auth/validation";
import { actionError, type ActionResult } from "@/lib/action-result";

async function clientIp(): Promise<string> {
  const headerList = await headers();
  // Vercel sets x-forwarded-for; fall back to a constant key locally so the
  // rate limiter still functions (just shared across all local requests).
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

const LOGIN_RATE_LIMIT = { maxAttempts: 5, windowSeconds: 60 };

export async function adminLoginAction(
  input: AdminLoginInput,
): Promise<ActionResult<never>> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const rateLimit = checkRateLimit(`admin-login:${ip}:${email}`, LOGIN_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return actionError(`Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.`);
  }

  const admin = await db.admin.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong - never reveal which one it was.
  const genericError = "Incorrect email or password.";
  if (!admin) {
    return actionError(genericError);
  }

  const passwordMatches = await verifyPassword(admin.passwordHash, password);
  if (!passwordMatches) {
    return actionError(genericError);
  }

  await createAdminSession({ role: "ADMIN", adminId: admin.id, gymId: admin.gymId });
  await recordAuditLog({
    gymId: admin.gymId,
    actorType: "ADMIN",
    actorId: admin.id,
    action: "ADMIN_LOGIN",
    entityType: "Admin",
    entityId: admin.id,
  });

  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function memberLoginAction(
  input: MemberLoginInput,
): Promise<ActionResult<never>> {
  const parsed = memberLoginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const { identifier, password } = parsed.data;

  const ip = await clientIp();
  const rateLimit = checkRateLimit(`member-login:${ip}:${identifier}`, LOGIN_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return actionError(`Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.`);
  }

  const member = await db.member.findFirst({
    where: { OR: [{ memberCode: identifier }, { phone: identifier }] },
  });

  const genericError = "Incorrect member ID/phone or password.";
  if (!member || !member.active) {
    return actionError(genericError);
  }

  const passwordMatches = await verifyPassword(member.passwordHash, password);
  if (!passwordMatches) {
    return actionError(genericError);
  }

  await createMemberSession({ role: "MEMBER", memberId: member.id, gymId: member.gymId });
  redirect("/member");
}

export async function memberLogoutAction(): Promise<void> {
  await clearMemberSession();
  redirect("/member/login");
}
