import "server-only";
import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { NotFoundError } from "@/lib/errors";
import { DB_TRANSACTION_OPTIONS } from "@/config/constants";
import { calculateMembershipExtension } from "@/modules/payments/expiry";
import type { RecordPaymentServiceInput } from "@/modules/payments/types";

export { calculateMembershipExtension } from "@/modules/payments/expiry";

/**
 * Records a payment and extends the member's membership window in a single
 * database transaction - the two must never be allowed to diverge (a
 * payment that exists without updating the membership, or a membership
 * update without a corresponding payment record, both violate the "this
 * replaces the owner's notebook" premise of the whole app).
 */
export async function recordPayment(
  gymId: string,
  input: RecordPaymentServiceInput,
  actorAdminId: string,
) {
  const member = await db.member.findFirst({ where: { id: input.memberId, gymId } });
  if (!member) throw new NotFoundError("Member");

  const paymentDate = input.paymentDate ?? new Date();
  const { membershipStartAfter, membershipEndAfter } = calculateMembershipExtension(
    member.membershipEnd,
    input.planDurationDays,
    paymentDate,
  );

  const [payment] = await db.$transaction(
    [
      db.payment.create({
        data: {
          gymId,
          memberId: member.id,
          amountPaise: input.amountPaise,
          method: input.method,
          status: "SUCCESS",
          planDurationDays: input.planDurationDays,
          paymentDate,
          membershipStartAfter,
          membershipEndAfter,
          notes: input.notes,
          recordedByAdminId: actorAdminId,
        },
      }),
      db.member.update({
        where: { id: member.id },
        data: { membershipStart: membershipStartAfter, membershipEnd: membershipEndAfter },
      }),
    ],
    DB_TRANSACTION_OPTIONS,
  );

  await recordAuditLog({
    gymId,
    actorType: "ADMIN",
    actorId: actorAdminId,
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { memberId: member.id, amountPaise: input.amountPaise },
  });

  return payment;
}

export async function listPaymentsForMember(gymId: string, memberId: string) {
  return db.payment.findMany({
    where: { gymId, memberId },
    orderBy: { paymentDate: "desc" },
  });
}
