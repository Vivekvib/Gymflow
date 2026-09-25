import { z } from "zod";

export const updateGymSchema = z.object({
  name: z.string().trim().min(2, "Gym name is too short").max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z
    .union([z.string().trim().email("Enter a valid email address"), z.literal("")])
    .optional(),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
});

export type UpdateGymInput = z.infer<typeof updateGymSchema>;
