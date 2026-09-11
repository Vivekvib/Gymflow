import { z } from "zod";

const optionalDateSchema = z.string().trim().optional().or(z.literal(""));
const optionalNotesSchema = z.string().trim().max(300).optional().or(z.literal(""));

export const logWeightSchema = z.object({
  weightKg: z.coerce.number().positive("Enter a valid weight").max(400),
  date: optionalDateSchema,
  notes: optionalNotesSchema,
});
export type LogWeightInput = z.infer<typeof logWeightSchema>;

export const logMeasurementsSchema = z.object({
  waistCm: z.coerce.number().positive().max(300).optional(),
  chestCm: z.coerce.number().positive().max(300).optional(),
  hipCm: z.coerce.number().positive().max(300).optional(),
  armCm: z.coerce.number().positive().max(300).optional(),
  thighCm: z.coerce.number().positive().max(300).optional(),
  date: optionalDateSchema,
  notes: optionalNotesSchema,
});
export type LogMeasurementsInput = z.infer<typeof logMeasurementsSchema>;

export const goalSchema = z.object({
  goalType: z.enum(["LOSE", "GAIN", "MAINTAIN", "FITNESS"]),
  targetWeightKg: z.coerce.number().positive().max(400).optional(),
  targetDate: optionalDateSchema,
  notes: optionalNotesSchema,
});
export type GoalInput = z.infer<typeof goalSchema>;

export const bmiCalculatorSchema = z.object({
  weightKg: z.coerce.number().positive().max(400),
  heightCm: z.coerce.number().positive().max(300),
});
export type BmiCalculatorInput = z.infer<typeof bmiCalculatorSchema>;
