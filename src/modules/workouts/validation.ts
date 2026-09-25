import { z } from "zod";

const exerciseSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required").max(120),
  sets: z.coerce.number().int().positive("Enter a valid number of sets").max(20),
  reps: z.string().trim().min(1, 'Reps required (e.g. "8-10")').max(20),
  restSeconds: z.coerce.number().int().nonnegative().max(600).optional(),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
});

const daySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  title: z.string().trim().min(1, "Day title is required").max(80),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise"),
});

export const workoutPlanSchema = z.object({
  title: z.string().trim().min(1, "Plan title is required").max(120),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  days: z.array(daySchema).min(1, "Add at least one day"),
});

export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
export type WorkoutDayInput = z.infer<typeof daySchema>;
export type WorkoutExerciseInput = z.infer<typeof exerciseSchema>;

/** 0 = Sunday .. 6 = Saturday, matching WorkoutPlanDay.dayOfWeek in the schema. */
export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const;

export const EMPTY_EXERCISE: WorkoutExerciseInput = {
  name: "",
  sets: 3,
  reps: "8-10",
  restSeconds: 60,
  notes: "",
};

export const EMPTY_DAY: WorkoutDayInput = {
  dayOfWeek: 1,
  title: "",
  exercises: [EMPTY_EXERCISE],
};
