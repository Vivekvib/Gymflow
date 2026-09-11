export type BmiCategory = "Underweight" | "Normal" | "Overweight" | "Obesity";

/**
 * BMI = weight(kg) / height(m)^2. A general fitness/health indicator, not
 * a diagnosis - the UI that renders this should say so (see
 * components/member/bmi-calculator.tsx).
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function categorizeBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}

export function roundBmi(bmi: number): number {
  return Math.round(bmi * 10) / 10;
}
