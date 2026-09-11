"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { logWeightSchema, type LogWeightInput } from "@/modules/progress/validation";
import { logWeightAction } from "@/modules/progress/actions";

export function WeightForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogWeightInput>({ resolver: zodResolver(logWeightSchema) });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await logWeightAction(data);
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
        <Label htmlFor="weightKg">Weight (kg)</Label>
        <Input id="weightKg" type="number" step="0.1" {...register("weightKg")} />
        {errors.weightKg ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.weightKg.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="date">Date (defaults to today)</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <Button type="submit" isLoading={isPending}>
        Save
      </Button>
    </form>
  );
}
