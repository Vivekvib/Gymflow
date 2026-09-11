"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { goalSchema, type GoalInput } from "@/modules/progress/validation";
import { upsertGoalAction } from "@/modules/progress/actions";

interface GoalFormProps {
  defaultValues?: Partial<GoalInput>;
}

export function GoalForm({ defaultValues }: GoalFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalInput>({ resolver: zodResolver(goalSchema), defaultValues });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await upsertGoalAction(data);
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/member/progress");
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}

      <div>
        <Label htmlFor="goalType">Goal type</Label>
        <Select id="goalType" {...register("goalType")}>
          <option value="LOSE">Lose weight</option>
          <option value="GAIN">Gain weight</option>
          <option value="MAINTAIN">Maintain weight</option>
          <option value="FITNESS">General fitness</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="targetWeightKg">Target weight (kg, optional)</Label>
        <Input id="targetWeightKg" type="number" step="0.1" {...register("targetWeightKg")} />
        {errors.targetWeightKg ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.targetWeightKg.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="targetDate">Target date (optional)</Label>
        <Input id="targetDate" type="date" {...register("targetDate")} />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <Button type="submit" isLoading={isPending}>
        Save goal
      </Button>
    </form>
  );
}
