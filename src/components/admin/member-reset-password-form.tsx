"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  adminResetPasswordSchema,
  type AdminResetPasswordInput,
} from "@/modules/members/validation";
import { adminResetMemberPasswordAction } from "@/modules/members/actions";

interface MemberResetPasswordFormProps {
  memberId: string;
}

export function MemberResetPasswordForm({ memberId }: MemberResetPasswordFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminResetPasswordInput>({ resolver: zodResolver(adminResetPasswordSchema) });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    setSavedAt(null);
    startTransition(async () => {
      const result = await adminResetMemberPasswordAction(memberId, data);
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong.");
        return;
      }
      setSavedAt(Date.now());
      reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}
      {savedAt ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          Password reset. Share the new password with the member directly.
        </p>
      ) : null}

      <div>
        <Label htmlFor="resetNewPassword">New password</Label>
        <Input
          id="resetNewPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" variant="secondary" isLoading={isPending}>
        Reset password
      </Button>
    </form>
  );
}
