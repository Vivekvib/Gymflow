import { z } from "zod";

/**
 * This is the *form* schema - amounts are entered and validated in rupees,
 * because that's what an admin types. modules/payments/actions.ts converts
 * to paise (via lib/currency) before calling the service, which never
 * accepts a rupee amount.
 */
export const recordPaymentSchema = z.object({
  memberId: z.string().min(1, "Select a member"),
  amountRupees: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "RAZORPAY", "STRIPE"]),
  planDurationDays: z.coerce.number().int().positive("Duration must be at least 1 day"),
  paymentDate: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type RecordPaymentFormInput = z.infer<typeof recordPaymentSchema>;

/** Common plan durations shown as quick-select buttons on the payment form. */
export const PLAN_DURATION_PRESETS = [
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "12 months", days: 365 },
] as const;
