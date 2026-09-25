"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DAY_OF_WEEK_OPTIONS,
  EMPTY_DAY,
  EMPTY_EXERCISE,
  workoutPlanSchema,
  type WorkoutPlanInput,
} from "@/modules/workouts/validation";
import { upsertWorkoutPlanAction } from "@/modules/workouts/actions";

interface WorkoutPlanFormProps {
  memberId: string;
  defaultValues?: WorkoutPlanInput;
}

export function WorkoutPlanForm({ memberId, defaultValues }: WorkoutPlanFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutPlanInput>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: defaultValues ?? { title: "", notes: "", days: [EMPTY_DAY] },
  });

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({ control, name: "days" });

  const onSubmit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const result = await upsertWorkoutPlanAction(memberId, data);
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(`/admin/workouts/${memberId}`);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {serverError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {serverError}
        </p>
      ) : null}

      <div className="max-w-xl space-y-4">
        <div>
          <Label htmlFor="title">Plan title</Label>
          <Input id="title" placeholder="e.g. Full Body Starter Plan" {...register("title")} />
          {errors.title ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.title.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>

      <div className="space-y-4">
        {dayFields.map((dayField, dayIndex) => (
          <WorkoutDayFields
            key={dayField.id}
            control={control}
            register={register}
            dayIndex={dayIndex}
            onRemoveDay={dayFields.length > 1 ? () => removeDay(dayIndex) : undefined}
            errors={errors}
          />
        ))}

        {errors.days?.message ? (
          <p className="text-xs text-[var(--color-danger)]">{errors.days.message}</p>
        ) : null}

        <Button type="button" variant="secondary" size="sm" onClick={() => appendDay(EMPTY_DAY)}>
          <Plus className="h-4 w-4" /> Add day
        </Button>
      </div>

      <Button type="submit" isLoading={isPending}>
        Save workout plan
      </Button>
    </form>
  );
}

interface WorkoutDayFieldsProps {
  control: Control<WorkoutPlanInput>;
  register: UseFormRegister<WorkoutPlanInput>;
  dayIndex: number;
  onRemoveDay?: () => void;
  errors: FieldErrors<WorkoutPlanInput>;
}

/**
 * Its own useFieldArray scoped to `days.${dayIndex}.exercises` - the
 * standard react-hook-form pattern for a second level of nesting: the
 * parent array (days) can't itself manage a field array per row, so each
 * row gets a child component that manages its own nested array off the
 * same shared `control`.
 */
function WorkoutDayFields({ control, register, dayIndex, onRemoveDay, errors }: WorkoutDayFieldsProps) {
  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({ control, name: `days.${dayIndex}.exercises` });

  const dayErrors = errors.days?.[dayIndex];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Day {dayIndex + 1}</CardTitle>
        {onRemoveDay ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemoveDay}>
            <Trash2 className="h-4 w-4" /> Remove day
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`days.${dayIndex}.dayOfWeek`}>Day of week</Label>
            <Select id={`days.${dayIndex}.dayOfWeek`} {...register(`days.${dayIndex}.dayOfWeek`)}>
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`days.${dayIndex}.title`}>Title</Label>
            <Input
              id={`days.${dayIndex}.title`}
              placeholder="e.g. Full Body A"
              {...register(`days.${dayIndex}.title`)}
            />
            {dayErrors?.title ? (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{dayErrors.title.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {exerciseFields.map((exerciseField, exerciseIndex) => (
            <div
              key={exerciseField.id}
              className="grid grid-cols-12 items-end gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] p-3"
            >
              <div className="col-span-4">
                <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.name`}>Exercise</Label>
                <Input
                  id={`days.${dayIndex}.exercises.${exerciseIndex}.name`}
                  {...register(`days.${dayIndex}.exercises.${exerciseIndex}.name`)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.sets`}>Sets</Label>
                <Input
                  id={`days.${dayIndex}.exercises.${exerciseIndex}.sets`}
                  type="number"
                  {...register(`days.${dayIndex}.exercises.${exerciseIndex}.sets`)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.reps`}>Reps</Label>
                <Input
                  id={`days.${dayIndex}.exercises.${exerciseIndex}.reps`}
                  placeholder="8-10"
                  {...register(`days.${dayIndex}.exercises.${exerciseIndex}.reps`)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor={`days.${dayIndex}.exercises.${exerciseIndex}.restSeconds`}>
                  Rest (s)
                </Label>
                <Input
                  id={`days.${dayIndex}.exercises.${exerciseIndex}.restSeconds`}
                  type="number"
                  {...register(`days.${dayIndex}.exercises.${exerciseIndex}.restSeconds`)}
                />
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={exerciseFields.length <= 1}
                  onClick={() => removeExercise(exerciseIndex)}
                  aria-label="Remove exercise"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {dayErrors?.exercises?.message ? (
            <p className="text-xs text-[var(--color-danger)]">{dayErrors.exercises.message}</p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => appendExercise(EMPTY_EXERCISE)}
        >
          <Plus className="h-4 w-4" /> Add exercise
        </Button>
      </CardContent>
    </Card>
  );
}
