"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { logMeasurementsSchema, type LogMeasurementsInput } from "@/modules/progress/validation";
import { logMeasurementsAction } from "@/modules/progress/actions";

export function MeasurementsForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const { register, handleSubmit } = useForm<LogMeasurementsInput>({
    resolver: zodResolver(logMeasurementsSchema),
  });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await logMeasurementsAction(data);
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

      <p className="text-sm text-[var(--color-ink-muted)]">
        Leave any measurement blank if you didn&apos;t take it this time.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="waistCm">Waist (cm)</Label>
          <Input id="waistCm" type="number" step="0.1" {...register("waistCm")} />
        </div>
        <div>
          <Label htmlFor="chestCm">Chest (cm)</Label>
          <Input id="chestCm" type="number" step="0.1" {...register("chestCm")} />
        </div>
        <div>
          <Label htmlFor="hipCm">Hip (cm)</Label>
          <Input id="hipCm" type="number" step="0.1" {...register("hipCm")} />
        </div>
        <div>
          <Label htmlFor="armCm">Arm (cm)</Label>
          <Input id="armCm" type="number" step="0.1" {...register("armCm")} />
        </div>
        <div>
          <Label htmlFor="thighCm">Thigh (cm)</Label>
          <Input id="thighCm" type="number" step="0.1" {...register("thighCm")} />
        </div>
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
