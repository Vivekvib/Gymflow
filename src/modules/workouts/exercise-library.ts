import {
  EXERCISE_CATALOG,
  MUSCLE_GROUPS,
  type CatalogExercise,
  type MuscleGroup,
} from "@/modules/workouts/exercise-catalog";

/**
 * Deliberately has no "server-only" import: the admin plan editor (a Client
 * Component) uses it for the dropdowns, while the member workout page (a
 * Server Component) uses it only to resolve video links, so the catalog
 * never ships to a member's browser.
 *
 * Lookups are by exercise *name* rather than id because PlanExercise stores
 * only the name (no schema change was needed for this feature). That is
 * safe because names are globally unique across the whole catalog - checked
 * when the catalog was built, and re-checked by tests/unit/exercise-library.test.ts.
 */

const exercisesByGroup = new Map<MuscleGroup, CatalogExercise[]>();
const exercisesByName = new Map<string, CatalogExercise>();

for (const group of MUSCLE_GROUPS) {
  exercisesByGroup.set(group, []);
}
for (const exercise of EXERCISE_CATALOG) {
  exercisesByGroup.get(exercise.muscleGroup)?.push(exercise);
  exercisesByName.set(exercise.name, exercise);
}

export function getExercisesForGroup(group: MuscleGroup): readonly CatalogExercise[] {
  return exercisesByGroup.get(group) ?? [];
}

export function findCatalogExerciseByName(name: string): CatalogExercise | undefined {
  return exercisesByName.get(name);
}

/** The demonstration video for an exercise, or null if the name isn't in the catalog or has no video. */
export function findExerciseVideoUrl(name: string): string | null {
  return exercisesByName.get(name)?.videoUrl ?? null;
}

export function isMuscleGroup(value: string): value is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(value);
}

export { MUSCLE_GROUPS };
export type { CatalogExercise, MuscleGroup };
