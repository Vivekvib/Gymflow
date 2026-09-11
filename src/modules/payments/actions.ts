"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/guards";
import { actionError, type ActionResult } from "@/lib/action-result";
import { NotFoundError } from "@/lib/errors";
import { rupeesToPaise } from "@/lib/currency";
import { recordPayment } from "@/modules/payments/service";
import { recordPaymentSchema, type RecordPaymentFormInput } from "@/modules/payments/validation";

export async function recordPaymentAction(
  input: RecordPaymentFormInput,
): Promise<ActionResult<never>> {
  const session = await requireAdminSession();

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  let memberId: string;
  try {
    const payment = await recordPayment(
      session.gymId,
      {
        memberId: parsed.data.memberId,
        amountPaise: rupeesToPaise(parsed.data.amountRupees),
        method: parsed.data.method,
        planDurationDays: parsed.data.planDurationDays,
        paymentDate: parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : undefined,
        notes: parsed.data.notes || undefined,
      },
      session.adminId,
    );
    memberId = payment.memberId;
  } catch (error) {
    if (error instanceof NotFoundError) return actionError("Member not found.");
    return actionError(error instanceof Error ? error.message : "Failed to record payment");
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin/members");
  revalidatePath("/admin");
  redirect(`/admin/members/${memberId}`);
}
