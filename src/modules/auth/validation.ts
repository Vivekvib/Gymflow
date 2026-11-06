import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Members log in with either their member ID (e.g. "GYM-0001") or their
 * mobile number. `identifier` covers both: memberLoginAction matches it
 * against the member ID (any capitalisation) and against every common way a
 * mobile number is written (see lib/phone.ts).
 */
export const memberLoginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your member ID or mobile number"),
  password: z.string().min(1, "Password is required"),
});

export type MemberLoginInput = z.infer<typeof memberLoginSchema>;
