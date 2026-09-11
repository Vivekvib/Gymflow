import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession, getMemberSession } from "@/modules/auth/session";
import type { AdminSessionPayload, MemberSessionPayload } from "@/modules/auth/types";

/**
 * middleware.ts already blocks unauthenticated requests to /admin/* and
 * /member/* before they render. These guards exist anyway, because:
 *   1. Server Actions can be invoked directly (not just via a page render),
 *      bypassing middleware's route matching.
 *   2. Defense in depth - a future middleware matcher typo should not be
 *      the only thing standing between a request and admin data.
 */

export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireMemberSession(): Promise<MemberSessionPayload> {
  const session = await getMemberSession();
  if (!session) {
    redirect("/member/login");
  }
  return session;
}
