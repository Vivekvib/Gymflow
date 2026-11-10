import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_DISPLAY,
  MEMBERSHIP_STATES,
  MEMBER_STATUS_FILTERS,
  getMembership,
  getMembershipDisplay,
} from "@/modules/membership/state";
import { EXPIRING_SOON_DAYS } from "@/config/constants";

// All moments are written in IST (+05:30), the gym's timezone, because the
// rules are about the gym's calendar days, not the server's UTC ones.
const at = (iso: string) => new Date(`${iso}+05:30`);
const TODAY = "2026-11-10";
const NOW = at(`${TODAY}T14:00:00`);

function daysFromToday(days: number, time = "10:00:00") {
  const base = new Date(`${TODAY}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return at(`${base.toISOString().slice(0, 10)}T${time}`);
}

describe("getMembership: states", () => {
  it("a member who has never paid is NEW and should be given a first payment", () => {
    const m = getMembership({ active: true, membershipEnd: null }, { now: NOW });
    expect(m).toMatchObject({ state: "NEW", daysLeft: null, validUntil: null, canEnter: false, nextAction: "ADD_PAYMENT" });
  });

  it("an admin-deactivated member is INACTIVE whatever their dates say", () => {
    expect(getMembership({ active: false, membershipEnd: null }, { now: NOW }).state).toBe("INACTIVE");
    const paidUp = getMembership({ active: false, membershipEnd: daysFromToday(60) }, { now: NOW });
    expect(paidUp.state).toBe("INACTIVE");
    expect(paidUp.canEnter).toBe(false);
    expect(paidUp.nextAction).toBe("REACTIVATE");
    expect(paidUp.daysLeft).toBe(60); // the dates are still reported, so an admin can see them
  });

  it("plenty of time left is ACTIVE with nothing to do", () => {
    const m = getMembership({ active: true, membershipEnd: daysFromToday(60) }, { now: NOW });
    expect(m).toMatchObject({ state: "ACTIVE", daysLeft: 60, canEnter: true, nextAction: "NONE" });
  });

  it(`flips to EXPIRING exactly when ${EXPIRING_SOON_DAYS} days are left`, () => {
    expect(getMembership({ active: true, membershipEnd: daysFromToday(EXPIRING_SOON_DAYS + 1) }, { now: NOW }).state).toBe("ACTIVE");
    const edge = getMembership({ active: true, membershipEnd: daysFromToday(EXPIRING_SOON_DAYS) }, { now: NOW });
    expect(edge).toMatchObject({ state: "EXPIRING", daysLeft: EXPIRING_SOON_DAYS, nextAction: "RENEW", canEnter: true });
  });

  it("a lapsed membership is EXPIRED and should be renewed", () => {
    const m = getMembership({ active: true, membershipEnd: daysFromToday(-12) }, { now: NOW });
    expect(m).toMatchObject({ state: "EXPIRED", daysLeft: -12, canEnter: false, nextAction: "RENEW" });
  });
});

describe("getMembership: the last paid day", () => {
  // Paid at 10:00 for a plan that ends today at 10:00. The member is told
  // "Valid till <today>", so the evening of that day must not say "Expired".
  const end = daysFromToday(0, "10:00:00");

  it("is still EXPIRING, with 0 days left and entry allowed, in the evening", () => {
    const m = getMembership({ active: true, membershipEnd: end }, { now: at(`${TODAY}T20:00:00`) });
    expect(m).toMatchObject({ state: "EXPIRING", daysLeft: 0, canEnter: true, nextAction: "RENEW" });
  });

  it("is still EXPIRING at the very last millisecond of the day", () => {
    const m = getMembership({ active: true, membershipEnd: end }, { now: at(`${TODAY}T23:59:59.999`) });
    expect(m.state).toBe("EXPIRING");
    expect(m.canEnter).toBe(true);
  });

  it("becomes EXPIRED at midnight, and validUntil is exactly that moment", () => {
    const midnight = at("2026-11-11T00:00:00");
    const m = getMembership({ active: true, membershipEnd: end }, { now: midnight });
    expect(m).toMatchObject({ state: "EXPIRED", daysLeft: -1, canEnter: false });
    expect(m.validUntil).toEqual(midnight);
  });

  it("counts days on the gym's calendar, not UTC's", () => {
    // 18:31 UTC on 10 Nov is 00:01 IST on 11 Nov: already the next gym day.
    const m = getMembership({ active: true, membershipEnd: end }, { now: new Date("2026-11-10T18:31:00Z") });
    expect(m.daysLeft).toBe(-1);
    expect(m.state).toBe("EXPIRED");
  });

  it("a payment taken just after midnight still lasts through its last day", () => {
    const early = daysFromToday(30, "00:05:00");
    expect(getMembership({ active: true, membershipEnd: early }, { now: at(`${daysFromToday(30).toISOString().slice(0, 10)}T12:00:00`) }).daysLeft).toBe(0);
  });
});

describe("one vocabulary", () => {
  it("every state has wording, a colour and a next action", () => {
    for (const state of MEMBERSHIP_STATES) {
      const { label, tone, action } = MEMBERSHIP_DISPLAY[state];
      expect(label.length).toBeGreaterThan(0);
      expect(tone).toBeTruthy();
      expect(action).toBeTruthy();
      expect(getMembershipDisplay(state)).toEqual({ label, tone });
    }
  });

  it("the members-list URL filters are ALL plus every state except NEW (which lives under Expired)", () => {
    expect([...MEMBER_STATUS_FILTERS].sort()).toEqual(
      ["ALL", ...MEMBERSHIP_STATES.filter((s) => s !== "NEW")].sort(),
    );
  });

  it("the wording members and the owner see", () => {
    expect(getMembershipDisplay("NEW").label).toBe("No plan yet");
    expect(getMembershipDisplay("EXPIRING").label).toBe("Expiring soon");
  });
});
