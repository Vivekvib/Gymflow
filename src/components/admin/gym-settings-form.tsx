"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateGymSchema, type UpdateGymInput } from "@/modules/gym/validation";
import { updateGymAction } from "@/modules/gym/actions";

interface GymSettingsFormProps {
  defaultValues: UpdateGymInput;
}

export function GymSettingsForm({ defaultValues }: GymSettingsFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateGymInput>({ resolver: zodResolver(updateGymSchema), defaultValues });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateGymAction(data);
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong.");
        return;
      }
      setSavedAt(Date.now());
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}
      {savedAt ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          Settings saved.
        </p>
      ) : null}

      <div>
        <Label htmlFor="name">Gym name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" {...register("city")} />
      </div>

      <Button type="submit" isLoading={isPending}>
        Save settings
      </Button>
    </form>
  );
}
