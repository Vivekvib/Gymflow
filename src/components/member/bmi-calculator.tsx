"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateBmi, categorizeBmi, roundBmi } from "@/modules/progress/bmi";

interface BmiCalculatorProps {
  defaultHeightCm?: number | null;
}

export function BmiCalculator({ defaultHeightCm }: BmiCalculatorProps) {
  const [weightKg, setWeightKg] = React.useState("");
  const [heightCm, setHeightCm] = React.useState(defaultHeightCm ? String(defaultHeightCm) : "");

  const weight = parseFloat(weightKg);
  const height = parseFloat(heightCm);
  const canCalculate = weight > 0 && height > 0;
  const bmi = canCalculate ? roundBmi(calculateBmi(weight, height)) : null;
  const category = bmi !== null ? categorizeBmi(bmi) : null;

  return (
    <div className="max-w-sm space-y-4">
      <div>
        <Label htmlFor="bmi-weight">Weight (kg)</Label>
        <Input
          id="bmi-weight"
          type="number"
          step="0.1"
          value={weightKg}
          onChange={(event) => setWeightKg(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="bmi-height">Height (cm)</Label>
        <Input
          id="bmi-height"
          type="number"
          step="0.1"
          value={heightCm}
          onChange={(event) => setHeightCm(event.target.value)}
        />
      </div>

      {bmi !== null ? (
        <div className="rounded-lg border border-[var(--color-line)] p-4">
          <p className="text-sm text-[var(--color-ink-muted)]">Your BMI</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--color-ink)]">{bmi}</p>
          <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{category}</p>
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
            BMI is a general fitness indicator, not a medical diagnosis - talk to a doctor for
            personalized health advice.
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Enter your weight and height to see your BMI.
        </p>
      )}
    </div>
  );
}
