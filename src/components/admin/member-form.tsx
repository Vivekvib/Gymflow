"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "@/modules/members/validation";
import { createMemberAction, updateMemberAction } from "@/modules/members/actions";

type MemberFormProps =
  | { mode: "create" }
  | { mode: "edit"; memberId: string; defaultValues: UpdateMemberInput };

/**
 * One form powers both create and edit. The two zod schemas only differ by
 * the `password` field (required on create, absent on edit), so a couple of
 * `as` casts bridge that at the register()/onSubmit() boundary rather than
 * duplicating every field across two near-identical components.
 */
export function MemberForm(props: MemberFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const isCreate = props.mode === "create";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(isCreate ? createMemberSchema : (updateMemberSchema as typeof createMemberSchema)),
    defaultValues: isCreate ? undefined : (props.defaultValues as CreateMemberInput),
  });
  const fieldErrors = errors as FieldErrors<CreateMemberInput>;

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      if (isCreate) {
        const result = await createMemberAction(data);
        if (!result.success) {
          setServerError(result.error ?? "Something went wrong.");
          return;
        }
        router.push(`/admin/members/${result.data?.memberId}`);
      } else {
        const { password: _password, ...rest } = data;
        const result = await updateMemberAction(props.memberId, rest as UpdateMemberInput);
        if (result && !result.success) {
          setServerError(result.error ?? "Something went wrong.");
        }
        // On success updateMemberAction redirects server-side, so there is
        // no success branch to handle here.
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={fieldErrors.name?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          <FieldError message={fieldErrors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" {...register("email")} />
          <FieldError message={fieldErrors.email?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" defaultValue="" {...register("gender")}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" type="number" step="0.1" {...register("heightCm")} />
          <FieldError message={fieldErrors.heightCm?.message} />
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
          <FieldError message={fieldErrors.emergencyContactPhone?.message} />
        </div>
      </div>

      {isCreate ? (
        <div>
          <Label htmlFor="password">Temporary password</Label>
          <Input id="password" type="password" {...register("password")} />
          <FieldError message={fieldErrors.password?.message} />
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Share this with the member directly - they can change it later from their profile.
          </p>
        </div>
      ) : null}

      <Button type="submit" isLoading={isPending}>
        {isCreate ? "Add member" : "Save changes"}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[var(--color-danger)]">{message}</p>;
}
