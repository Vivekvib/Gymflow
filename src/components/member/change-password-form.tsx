"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { changePasswordSchema, type ChangePasswordInput } from "@/modules/members/validation";
import { changeMemberPasswordAction } from "@/modules/members/actions";

export function ChangePasswordForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await changeMemberPasswordAction(data);
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong.");
        return;
      }
      setSavedAt(Date.now());
      reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}
      {savedAt ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          Password changed.
        </p>
      ) : null}

      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" isLoading={isPending}>
        Change password
      </Button>
    </form>
  );
}
