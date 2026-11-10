import "server-only";
import { db } from "@/lib/db";

/**
 * Whether a signed-in member's session may keep working.
 *
 * A session is a signed 7-day cookie, so it says who someone was when they
 * logged in - not who they are now. This is the "now": the account must still
 * exist and still be switched on. Switching a member off at the front desk
 * therefore takes effect on their next request, not after the cookie expires.
 *
 *   OK         carry on
 *   SUSPENDED  the front desk switched the account off
 *   GONE       the account no longer exists (or never belonged to this gym)
 */
export type MemberAccess = "OK" | "SUSPENDED" | "GONE";

export async function getMemberAccess(gymId: string, memberId: string): Promise<MemberAccess> {
  const member = await db.member.findFirst({ where: { id: memberId, gymId }, select: { active: true } });
  if (!member) return "GONE";
  return member.active ? "OK" : "SUSPENDED";
}
