"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { adminLoginSchema, type AdminLoginInput } from "@/modules/auth/validation";
import { adminLoginAction } from "@/modules/auth/actions";

export function AdminLoginForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await adminLoginAction(data);
      // adminLoginAction redirects on success, so reaching here means it failed.
      if (result && !result.success) {
        setServerError(result.error ?? "Something went wrong.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="username" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" isLoading={isPending}>
        Sign in
      </Button>
    </form>
  );
}
