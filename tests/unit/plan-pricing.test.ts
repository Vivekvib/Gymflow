import { describe, expect, it } from "vitest";
import { getPlanPriceLabel } from "@/lib/plan-pricing";
import { MEMBERSHIP_PRICES_INR } from "@/config/marketing";
import { PLAN_DURATION_PRESETS } from "@/modules/payments/validation";

describe("getPlanPriceLabel", () => {
  it("returns null when a plan has no configured price", () => {
    expect(getPlanPriceLabel(30, {})).toBeNull();
  });

  it("formats a configured price in rupees", () => {
    expect(getPlanPriceLabel(30, { 30: 1500 })).toContain("1,500");
  });

  it("treats zero, negative, and non-numeric values as 'no price'", () => {
    expect(getPlanPriceLabel(30, { 30: 0 })).toBeNull();
    expect(getPlanPriceLabel(30, { 30: -100 })).toBeNull();
    expect(getPlanPriceLabel(30, { 30: Number.NaN })).toBeNull();
  });
});

describe("marketing price config", () => {
  it("only prices plan lengths the payment form can actually record", () => {
    const validDays = PLAN_DURATION_PRESETS.map((preset) => preset.days) as number[];
    for (const key of Object.keys(MEMBERSHIP_PRICES_INR)) {
      expect(validDays).toContain(Number(key));
    }
  });
});
