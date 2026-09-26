"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateMemberSchema, type UpdateMemberInput } from "@/modules/members/validation";
import { updateOwnProfileAction } from "@/modules/members/actions";

interface ProfileFormProps {
  defaultValues: UpdateMemberInput;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateMemberInput>({ resolver: zodResolver(updateMemberSchema), defaultValues });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await updateOwnProfileAction(data);
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
          Profile updated.
        </p>
      ) : null}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.phone.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" defaultValue={defaultValues.gender ?? ""} {...register("gender")}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" type="number" step="0.1" {...register("heightCm")} />
          {errors.heightCm ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.heightCm.message}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyContactName">Emergency contact name</Label>
          <Input id="emergencyContactName" {...register("emergencyContactName")} />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
          <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} />
          {errors.emergencyContactPhone ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {errors.emergencyContactPhone.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" isLoading={isPending}>
        Save profile
      </Button>
    </form>
  );
}
