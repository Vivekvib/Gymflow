import { describe, expect, it } from "vitest";
import { calculateMembershipExtension } from "@/modules/payments/expiry";

describe("calculateMembershipExtension", () => {
  it("appends the new duration to an existing, still-active expiry", () => {
    const currentEnd = new Date("2026-12-15T00:00:00.000Z");
    const paymentDate = new Date("2026-09-09T00:00:00.000Z");

    const result = calculateMembershipExtension(currentEnd, 30, paymentDate);

    expect(result.membershipStartAfter).toEqual(currentEnd);
    expect(result.membershipEndAfter).toEqual(new Date("2027-01-14T00:00:00.000Z"));
  });

  it("starts from the payment date when the membership already expired", () => {
    const currentEnd = new Date("2026-08-15T00:00:00.000Z");
    const paymentDate = new Date("2026-09-09T00:00:00.000Z");

    const result = calculateMembershipExtension(currentEnd, 30, paymentDate);

    expect(result.membershipStartAfter).toEqual(paymentDate);
    expect(result.membershipEndAfter).toEqual(new Date("2026-10-09T00:00:00.000Z"));
  });

  it("starts from the payment date for a brand-new member with no prior membership", () => {
    const paymentDate = new Date("2026-09-09T00:00:00.000Z");

    const result = calculateMembershipExtension(null, 90, paymentDate);

    expect(result.membershipStartAfter).toEqual(paymentDate);
    expect(result.membershipEndAfter).toEqual(new Date("2026-12-08T00:00:00.000Z"));
  });

  it("treats an expiry exactly at the payment moment as already expired, not active", () => {
    const paymentDate = new Date("2026-09-09T00:00:00.000Z");

    const result = calculateMembershipExtension(paymentDate, 30, paymentDate);

    expect(result.membershipStartAfter).toEqual(paymentDate);
  });
});
