import { addDays } from "@/lib/dates";
import type { MembershipExtension } from "@/modules/payments/types";

/**
 * The membership-expiry rule described in the README:
 *   - If the member's current membership is still active on the payment
 *     date, the new duration is *appended* to the existing expiry -
 *     paying early never shortens time already paid for.
 *   - If the membership has already lapsed (or never existed), the new
 *     window starts from the payment date instead.
 *
 * Kept in its own module (no "server-only", no db import) specifically so
 * tests/unit/membership-expiry.test.ts can exercise it directly.
 */
export function calculateMembershipExtension(
  currentMembershipEnd: Date | null,
  planDurationDays: number,
  paymentDate: Date,
): MembershipExtension {
  const stillActive =
    currentMembershipEnd !== null && currentMembershipEnd.getTime() > paymentDate.getTime();

  const membershipStartAfter = stillActive ? currentMembershipEnd : paymentDate;
  const membershipEndAfter = addDays(membershipStartAfter, planDurationDays);

  return { membershipStartAfter, membershipEndAfter };
}
