"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
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
import {
  MUSCLE_GROUPS,
  findCatalogExerciseByName,
  findExerciseVideoUrl,
  getExercisesForGroup,
  isMuscleGroup,
  type MuscleGroup,
} from "@/modules/workouts/exercise-library";
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
    setValue,
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
            setValue={setValue}
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
  setValue: UseFormSetValue<WorkoutPlanInput>;
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
function WorkoutDayFields({
  control,
  register,
  setValue,
  dayIndex,
  onRemoveDay,
  errors,
}: WorkoutDayFieldsProps) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <ExerciseRowFields
              key={exerciseField.id}
              control={control}
              register={register}
              setValue={setValue}
              dayIndex={dayIndex}
              exerciseIndex={exerciseIndex}
              canRemove={exerciseFields.length > 1}
              onRemove={() => removeExercise(exerciseIndex)}
              errors={errors}
            />
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

interface ExerciseRowFieldsProps {
  control: Control<WorkoutPlanInput>;
  register: UseFormRegister<WorkoutPlanInput>;
  setValue: UseFormSetValue<WorkoutPlanInput>;
  dayIndex: number;
  exerciseIndex: number;
  canRemove: boolean;
  onRemove: () => void;
  errors: FieldErrors<WorkoutPlanInput>;
}

/**
 * One exercise: pick a muscle group, then pick from only that group's
 * exercises. The muscle group is purely a UI filter held in local state -
 * it is not part of the form data and is never saved (PlanExercise stores
 * just the exercise name, which is unique across the whole catalog, so the
 * group can always be derived back from it).
 */
function ExerciseRowFields({
  control,
  register,
  setValue,
  dayIndex,
  exerciseIndex,
  canRemove,
  onRemove,
  errors,
}: ExerciseRowFieldsProps) {
  const fieldPath = `days.${dayIndex}.exercises.${exerciseIndex}` as const;
  const namePath = `${fieldPath}.name` as const;

  const currentName = useWatch({ control, name: namePath }) ?? "";

  // When editing a saved plan, start on the group the saved exercise belongs
  // to; for a brand new row, start on the first group.
  const [muscleGroup, setMuscleGroup] = React.useState<MuscleGroup>(
    () => findCatalogExerciseByName(currentName)?.muscleGroup ?? MUSCLE_GROUPS[0],
  );

  const options = getExercisesForGroup(muscleGroup);

  // A name that isn't in the catalog (e.g. typed by hand before this feature
  // existed) is kept and shown honestly, rather than silently blanked.
  const isCustomName = currentName !== "" && !findCatalogExerciseByName(currentName);

  const videoUrl = findExerciseVideoUrl(currentName);
  const rowErrors = errors.days?.[dayIndex]?.exercises?.[exerciseIndex];

  function handleGroupChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isMuscleGroup(next)) return;
    setMuscleGroup(next);
    // The previously chosen exercise belongs to the old group and would no
    // longer be among the options - clear it so a stale, invisible value
    // can't be submitted.
    setValue(namePath, "", { shouldDirty: true });
  }

  return (
    <div className="grid grid-cols-2 items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-line)] p-3 sm:grid-cols-12">
      <div className="col-span-2 sm:col-span-4">
        <Label htmlFor={`${fieldPath}.muscleGroup`}>Muscle group</Label>
        <Select
          id={`${fieldPath}.muscleGroup`}
          value={muscleGroup}
          onChange={handleGroupChange}
        >
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
      </div>

      <div className="col-span-2 sm:col-span-8">
        <Label htmlFor={namePath}>Exercise</Label>
        <Select id={namePath} {...register(namePath)}>
          <option value="">Select an exercise</option>
          {isCustomName ? <option value={currentName}>{currentName} (custom)</option> : null}
          {options.map((exercise) => (
            <option key={exercise.id} value={exercise.name}>
              {exercise.name}
            </option>
          ))}
        </Select>
        {rowErrors?.name ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{rowErrors.name.message}</p>
        ) : null}
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Watch demo video
          </a>
        ) : null}
      </div>

      <div className="col-span-1 sm:col-span-3">
        <Label htmlFor={`${fieldPath}.sets`}>Sets</Label>
        <Input id={`${fieldPath}.sets`} type="number" {...register(`${fieldPath}.sets`)} />
        {rowErrors?.sets ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{rowErrors.sets.message}</p>
        ) : null}
      </div>
      <div className="col-span-1 sm:col-span-3">
        <Label htmlFor={`${fieldPath}.reps`}>Reps</Label>
        <Input id={`${fieldPath}.reps`} placeholder="8-10" {...register(`${fieldPath}.reps`)} />
        {rowErrors?.reps ? (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{rowErrors.reps.message}</p>
        ) : null}
      </div>
      <div className="col-span-1 sm:col-span-3">
        <Label htmlFor={`${fieldPath}.restSeconds`}>Rest (s)</Label>
        <Input
          id={`${fieldPath}.restSeconds`}
          type="number"
          {...register(`${fieldPath}.restSeconds`)}
        />
      </div>
      <div className="col-span-1 flex sm:col-span-3 sm:justify-end sm:self-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="Remove exercise"
          className="mt-6 sm:mt-0"
        >
          <Trash2 className="h-4 w-4" /> Remove
        </Button>
      </div>
    </div>
  );
}
