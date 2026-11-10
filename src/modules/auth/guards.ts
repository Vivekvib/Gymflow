import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminSession, getMemberSession } from "@/modules/auth/session";
import { getMemberAccess } from "@/modules/members/access";
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

/**
 * The signed-in member - and still allowed in. Beyond checking the cookie,
 * this asks the database whether the account is still switched on, so a
 * member the front desk deactivates is signed out on their next request
 * instead of keeping their session for up to a week.
 *
 * Middleware cannot do that check (it has no database), and a Server
 * Component cannot delete a cookie, so an ended session is sent to
 * /member/session-ended, a route handler that clears the cookie and lands on
 * the login page with a short explanation. Redirecting straight to the login
 * page would loop: middleware sends anyone with a cookie away from it.
 *
 * `cache` makes the layout, the page and any actions in one request share a
 * single database check.
 */
export const requireMemberSession = cache(async (): Promise<MemberSessionPayload> => {
  const session = await getMemberSession();
  if (!session) {
    redirect("/member/login");
  }

  const access = await getMemberAccess(session.gymId, session.memberId);
  if (access !== "OK") {
    redirect(`/member/session-ended?reason=${access === "SUSPENDED" ? "suspended" : "ended"}`);
  }
  return session;
});
