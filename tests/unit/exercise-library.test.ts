import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG, MUSCLE_GROUPS } from "@/modules/workouts/exercise-catalog";
import {
  findCatalogExerciseByName,
  findExerciseVideoUrl,
  getExercisesForGroup,
  isMuscleGroup,
} from "@/modules/workouts/exercise-library";

describe("exercise catalog data", () => {
  it("has globally unique names (required: PlanExercise stores only the name)", () => {
    const names = EXERCISE_CATALOG.map((exercise) => exercise.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has unique ids", () => {
    const ids = EXERCISE_CATALOG.map((exercise) => exercise.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses declared muscle groups, and every group has exercises", () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(MUSCLE_GROUPS).toContain(exercise.muscleGroup);
    }
    for (const group of MUSCLE_GROUPS) {
      expect(getExercisesForGroup(group).length).toBeGreaterThan(0);
    }
  });

  it("only has real http(s) links as video URLs (no stray text in the video column)", () => {
    for (const exercise of EXERCISE_CATALOG) {
      if (exercise.videoUrl !== null) {
        expect(exercise.videoUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it("has no blank names", () => {
    for (const exercise of EXERCISE_CATALOG) {
      expect(exercise.name.trim()).not.toBe("");
    }
  });
});

describe("exercise library lookups", () => {
  it("getExercisesForGroup returns only that group's exercises", () => {
    const chest = getExercisesForGroup("Chest");
    expect(chest.length).toBeGreaterThan(0);
    expect(chest.every((exercise) => exercise.muscleGroup === "Chest")).toBe(true);
  });

  it("finds an exercise by exact name", () => {
    const pushUp = findCatalogExerciseByName("Push-up");
    expect(pushUp?.muscleGroup).toBe("Chest");
  });

  it("returns null for an unknown exercise name instead of throwing", () => {
    expect(findExerciseVideoUrl("Definitely Not A Real Exercise")).toBeNull();
    expect(findCatalogExerciseByName("Definitely Not A Real Exercise")).toBeUndefined();
  });

  it("returns null for the one catalog entry that has no video", () => {
    expect(findExerciseVideoUrl("Seated Cable Crunch")).toBeNull();
  });

  it("isMuscleGroup narrows valid group names only", () => {
    expect(isMuscleGroup("Chest")).toBe(true);
    expect(isMuscleGroup("Forearms")).toBe(false);
  });
});
