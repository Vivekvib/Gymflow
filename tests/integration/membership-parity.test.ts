import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { EXPIRING_SOON_DAYS, RENEWAL_LAPSED_LOOKBACK_DAYS } from "@/config/constants";
import { getMembership } from "@/modules/membership/state";
import {
  canEnterWhere,
  endsWithinDays,
  membershipWhere,
  renewalsDueWhere,
} from "@/modules/membership/query";

/**
 * Needs DATABASE_URL pointing at a disposable Postgres with migrations
 * applied, like the other integration tests.
 *
 * The rule "where does this member stand" exists twice: in TypeScript
 * (getMembership, used to draw badges and prompts) and as SQL (query.ts, used
 * to list and count). This test creates members on every awkward boundary,
 * asks both versions the same question at several moments of the day, and
 * requires identical answers. If someone changes one and forgets the other,
 * this fails.
 */
const TZ = "Asia/Kolkata";
const ANCHOR_DAY = "2026-11-10"; // a Tuesday; the members' dates are built around it
const at = (iso: string) => new Date(`${iso}+05:30`);

function onDay(offsetDays: number, time: string): Date {
  const base = new Date(`${ANCHOR_DAY}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return at(`${base.toISOString().slice(0, 10)}T${time}`);
}

const OFFSETS = [-40, -31, -30, -29, -2, -1, 0, 1, 6, 7, 8, 14, 15, 16, 29, 30, 31, 60];
const TIMES = ["00:00:00.000", "10:00:00.000", "23:59:59.999"];

const MOMENTS = [
  ["just after midnight", `${ANCHOR_DAY}T00:00:01.000`],
  ["early morning", `${ANCHOR_DAY}T06:30:00.000`],
  ["mid-morning", `${ANCHOR_DAY}T10:00:00.001`],
  ["evening", `${ANCHOR_DAY}T20:00:00.000`],
  ["the last millisecond", `${ANCHOR_DAY}T23:59:59.999`],
  ["the next midnight", "2026-11-11T00:00:00.000"],
] as const;

describe("membership: TypeScript rule and SQL filters agree", () => {
  const stamp = Date.now();
  let gymId = "";
  const members: { id: string; active: boolean; membershipEnd: Date | null }[] = [];

  beforeAll(async () => {
    const gym = await db.gym.create({ data: { name: "Parity Gym", slug: `test-parity-${stamp}`, timezone: TZ } });
    gymId = gym.id;

    const specs: { active: boolean; membershipEnd: Date | null }[] = [
      { active: true, membershipEnd: null }, // never paid
      { active: false, membershipEnd: null }, // never paid and switched off
      { active: false, membershipEnd: onDay(30, "10:00:00.000") }, // switched off but paid up
      { active: false, membershipEnd: onDay(-5, "10:00:00.000") }, // switched off and lapsed
    ];
    for (const offset of OFFSETS) {
      for (const time of TIMES) specs.push({ active: true, membershipEnd: onDay(offset, time) });
    }

    for (const [index, spec] of specs.entries()) {
      const member = await db.member.create({
        data: {
          gymId,
          memberCode: `TEST-PAR-${stamp}-${index}`,
          name: `Parity ${index}`,
          phone: `5${String(stamp).slice(-7)}${String(index).padStart(2, "0")}`,
          passwordHash: "unused-in-this-test",
          ...spec,
        },
      });
      members.push({ id: member.id, ...spec });
    }
  });

  afterAll(async () => {
    await db.member.deleteMany({ where: { gymId } });
    await db.gym.deleteMany({ where: { id: gymId } });
  });

  async function idsMatching(where: object | null, extra: object = {}) {
    const rows = await db.member.findMany({ where: { gymId, ...extra, ...(where ?? {}) }, select: { id: true } });
    return rows.map((row) => row.id).sort();
  }

  const expected = (now: Date, keep: (m: ReturnType<typeof getMembership>, active: boolean) => boolean) =>
    members
      .filter((member) => keep(getMembership(member, { now, timeZone: TZ }), member.active))
      .map((member) => member.id)
      .sort();

  describe.each(MOMENTS)("at %s", (_label, iso) => {
    const now = at(iso);
    const opts = { now, timeZone: TZ };

    it("status filters give the same members as the state rule", async () => {
      expect(await idsMatching(membershipWhere("ACTIVE", opts))).toEqual(expected(now, (m) => m.state === "ACTIVE"));
      expect(await idsMatching(membershipWhere("EXPIRING", opts))).toEqual(expected(now, (m) => m.state === "EXPIRING"));
      expect(await idsMatching(membershipWhere("EXPIRED", opts))).toEqual(
        expected(now, (m) => m.state === "EXPIRED" || m.state === "NEW"),
      );
      expect(await idsMatching(membershipWhere("INACTIVE", opts))).toEqual(expected(now, (m) => m.state === "INACTIVE"));
      expect(membershipWhere("ALL", opts)).toBeNull();
    });

    it("every member is in exactly one of Active / Expiring / Expired-or-new / Inactive", async () => {
      const buckets = await Promise.all(
        (["ACTIVE", "EXPIRING", "EXPIRED", "INACTIVE"] as const).map((status) => idsMatching(membershipWhere(status, opts))),
      );
      const all = buckets.flat().sort();
      expect(all).toEqual(members.map((m) => m.id).sort());
      expect(new Set(all).size).toBe(all.length);
    });

    it("'ending within N days' counts match daysLeft", async () => {
      for (const days of [7, 15, 30]) {
        const got = await idsMatching(null, { active: true, membershipEnd: endsWithinDays(days, opts) });
        expect(got).toEqual(
          expected(now, (m, active) => active && m.daysLeft !== null && m.daysLeft >= 0 && m.daysLeft <= days),
        );
      }
    });

    it("`within` widens EXPIRING but never changes ACTIVE", async () => {
      expect(await idsMatching(membershipWhere("ACTIVE", { ...opts, withinDays: 7 }))).toEqual(
        await idsMatching(membershipWhere("ACTIVE", opts)),
      );
      expect(await idsMatching(membershipWhere("EXPIRING", { ...opts, withinDays: 30 }))).toEqual(
        expected(now, (m, active) => active && m.daysLeft !== null && m.daysLeft >= 0 && m.daysLeft <= 30),
      );
    });

    it("the 'may enter' filter matches canEnter", async () => {
      expect(await idsMatching(canEnterWhere(opts))).toEqual(expected(now, (m) => m.canEnter));
    });

    it("the renewals-due filter matches 'expiring, or lapsed within the lookback'", async () => {
      expect(await idsMatching(renewalsDueWhere(opts))).toEqual(
        expected(
          now,
          (m, active) =>
            active &&
            m.daysLeft !== null &&
            m.daysLeft >= -RENEWAL_LAPSED_LOOKBACK_DAYS &&
            m.daysLeft <= EXPIRING_SOON_DAYS,
        ),
      );
    });
  });
});
