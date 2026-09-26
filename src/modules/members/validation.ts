import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number (digits only, optional leading +)");

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

export const memberListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["ALL", "ACTIVE", "EXPIRING", "EXPIRED", "INACTIVE"]).default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
});

export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
