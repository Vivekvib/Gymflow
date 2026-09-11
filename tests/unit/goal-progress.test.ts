import { describe, expect, it } from "vitest";
import { calculateGoalProgressPercent } from "@/modules/progress/goal-progress";

describe("calculateGoalProgressPercent", () => {
  it("computes progress for a LOSE goal", () => {
    // 68kg -> target 58kg, currently at 61kg: 7 of 10 kg lost = 70%
    expect(calculateGoalProgressPercent("LOSE", 68, 61, 58)).toBe(70);
  });

  it("computes progress for a GAIN goal", () => {
    // 70kg -> target 78kg, currently at 72kg: 2 of 8 kg gained = 25%
    expect(calculateGoalProgressPercent("GAIN", 70, 72, 78)).toBe(25);
  });

  it("clamps at 100% when the member has surpassed their target", () => {
    expect(calculateGoalProgressPercent("LOSE", 68, 55, 58)).toBe(100);
  });

  it("clamps at 0% when the member has moved the wrong way", () => {
    expect(calculateGoalProgressPercent("LOSE", 68, 70, 58)).toBe(0);
  });

  it("returns null for MAINTAIN and FITNESS goals", () => {
    expect(calculateGoalProgressPercent("MAINTAIN", 68, 68, 68)).toBeNull();
    expect(calculateGoalProgressPercent("FITNESS", 68, 68, null)).toBeNull();
  });

  it("returns null when weight history or a target is missing", () => {
    expect(calculateGoalProgressPercent("LOSE", null, 61, 58)).toBeNull();
    expect(calculateGoalProgressPercent("LOSE", 68, 61, null)).toBeNull();
  });

  it("returns null when the target contradicts the goal direction", () => {
    // A "LOSE" goal with a target heavier than the start weight doesn't make sense.
    expect(calculateGoalProgressPercent("LOSE", 68, 61, 70)).toBeNull();
  });
});
