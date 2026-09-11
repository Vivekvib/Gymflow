import type { PaymentMethod } from "@/generated/prisma/client";

export interface MembershipExtension {
  membershipStartAfter: Date;
  membershipEndAfter: Date;
}

/**
 * Input to modules/payments/service.ts#recordPayment - already in paise
 * and already validated. The Server Action in actions.ts is responsible
 * for converting the raw rupee amount a form submits into this shape;
 * the service never sees rupees.
 */
export interface RecordPaymentServiceInput {
  memberId: string;
  amountPaise: number;
  method: PaymentMethod;
  planDurationDays: number;
  paymentDate?: Date;
  notes?: string;
}
