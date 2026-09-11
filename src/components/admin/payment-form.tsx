"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  recordPaymentSchema,
  PLAN_DURATION_PRESETS,
  type RecordPaymentFormInput,
} from "@/modules/payments/validation";
import { recordPaymentAction } from "@/modules/payments/actions";

interface MemberOption {
  id: string;
  name: string;
  memberCode: string;
}

interface PaymentFormProps {
  /** When set (recording a payment from a member's own detail page), the member picker is hidden. */
  preselectedMember?: MemberOption;
  /** Only needed when there is no preselected member - e.g. the standalone "record a payment" page. */
  memberOptions?: MemberOption[];
}

export function PaymentForm({ preselectedMember, memberOptions = [] }: PaymentFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordPaymentFormInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      memberId: preselectedMember?.id,
      method: "CASH",
      planDurationDays: PLAN_DURATION_PRESETS[0].days,
    },
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await recordPaymentAction(data);
      if (result && !result.success) {
        setServerError(result.error ?? "Something went wrong.");
      }
      // On success, recordPaymentAction redirects server-side.
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}

      {preselectedMember ? (
        <div>
          <Label>Member</Label>
          <p className="text-sm text-[var(--color-ink)]">
            {preselectedMember.name}{" "}
            <span className="text-[var(--color-ink-muted)]">({preselectedMember.memberCode})</span>
          </p>
          <input type="hidden" value={preselectedMember.id} {...register("memberId")} />
        </div>
      ) : (
        <div>
          <Label htmlFor="memberId">Member</Label>
          <Select id="memberId" {...register("memberId")}>
            <option value="">Select a member</option>
            {memberOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.memberCode})
              </option>
            ))}
          </Select>
          <FieldError message={errors.memberId?.message} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amountRupees">Amount (INR)</Label>
          <Input id="amountRupees" type="number" step="1" {...register("amountRupees")} />
          <FieldError message={errors.amountRupees?.message} />
        </div>
        <div>
          <Label htmlFor="method">Payment method</Label>
          <Select id="method" {...register("method")}>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="planDurationDays">Plan duration</Label>
        <Select id="planDurationDays" {...register("planDurationDays")}>
          {PLAN_DURATION_PRESETS.map((preset) => (
            <option key={preset.days} value={preset.days}>
              {preset.label}
            </option>
          ))}
        </Select>
        <FieldError message={errors.planDurationDays?.message} />
      </div>

      <div>
        <Label htmlFor="paymentDate">Payment date (defaults to today)</Label>
        <Input id="paymentDate" type="date" {...register("paymentDate")} />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <Button type="submit" isLoading={isPending}>
        Record payment
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[var(--color-danger)]">{message}</p>;
}
