import { z } from "zod";
import { DASHBOARD_EXPIRY_WINDOWS } from "@/config/constants";
import { MEMBER_STATUS_FILTERS } from "@/modules/membership/state";
import { normalizePhone, stripPhoneFormatting } from "@/lib/phone";

/**
 * Accepts a number however it was typed ("98107 40347", "+91 98107-40347")
 * and stores one canonical form (see lib/phone.ts), so the member can later
 * sign in with it no matter how they write it.
 */
const phoneSchema = z
  .string()
  .trim()
  .transform(stripPhoneFormatting)
  .pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number, for example 9810740347"))
  .transform(normalizePhone);

const optionalEmailSchema = z
  .union([z.string().trim().email("Enter a valid email address"), z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const sharedMemberFields = {
  name: z.string().trim().min(2, "Name is too short").max(120),
  phone: phoneSchema,
  email: optionalEmailSchema,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  heightCm: z.coerce.number().positive().max(300).optional(),
  emergencyContactName: z.string().trim().max(120).optional().or(z.literal("")),
  emergencyContactPhone: z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
};

export const createMemberSchema = z.object({
  ...sharedMemberFields,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = z.object(sharedMemberFields);

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Distinct from changePasswordSchema - an admin resetting a locked-out
 * member's password doesn't know (and shouldn't need) their old one.
 */
export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;

export const memberListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(MEMBER_STATUS_FILTERS).default("ALL"),
  /**
   * Narrows the EXPIRING filter to memberships ending within this many days
   * (the dashboard's 7 / 15 / 30 day links). Anything else is ignored.
   */
  within: z.coerce
    .number()
    .int()
    .refine((value) => (DASHBOARD_EXPIRY_WINDOWS as readonly number[]).includes(value))
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).default(1),
});

export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
