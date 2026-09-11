import type { PaymentMethod } from "@/generated/prisma/client";

/**
 * CASH, UPI (collected in person via a QR code the gym already owns), CARD
 * (a physical terminal), and BANK_TRANSFER are all recorded directly by an
 * admin through modules/payments/service.ts#recordPayment - there is no
 * "manual provider" adapter to implement, because there's no external
 * party to integrate with. This module exists to make that boundary
 * explicit and checkable, rather than implicit tribal knowledge.
 */
export const MANUAL_PAYMENT_METHODS: readonly PaymentMethod[] = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
];

export function isManualPaymentMethod(method: PaymentMethod): boolean {
  return MANUAL_PAYMENT_METHODS.includes(method);
}
