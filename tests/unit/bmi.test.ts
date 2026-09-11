import { describe, expect, it } from "vitest";
import { calculateBmi, categorizeBmi, roundBmi } from "@/modules/progress/bmi";

describe("calculateBmi", () => {
  it("computes BMI from weight in kg and height in cm", () => {
    // 70kg at 175cm -> 70 / 1.75^2 = 22.857...
    expect(roundBmi(calculateBmi(70, 175))).toBeCloseTo(22.9, 1);
  });
});

describe("categorizeBmi", () => {
  it.each([
    [17, "Underweight"],
    [18.4, "Underweight"],
    [18.5, "Normal"],
    [24.9, "Normal"],
    [25, "Overweight"],
    [29.9, "Overweight"],
    [30, "Obesity"],
    [40, "Obesity"],
  ])("categorizes %d as %s", (bmi, expected) => {
    expect(categorizeBmi(bmi)).toBe(expected);
  });
});
