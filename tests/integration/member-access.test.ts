import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { getMemberAccess } from "@/modules/members/access";

/**
 * Needs DATABASE_URL pointing at a disposable Postgres with migrations
 * applied, like the other integration tests.
 *
 * A member's session is a 7-day cookie. This is the check that makes
 * "switched off at the front desk" take effect on the next request instead of
 * when the cookie finally expires.
 */
describe("member access", () => {
  const stamp = Date.now();
  let gymId = "";
  let otherGymId = "";
  let memberId = "";

  beforeAll(async () => {
    gymId = (await db.gym.create({ data: { name: "Access Gym", slug: `test-access-${stamp}` } })).id;
    otherGymId = (await db.gym.create({ data: { name: "Access Other Gym", slug: `test-access-other-${stamp}` } })).id;
    memberId = (
      await db.member.create({
        data: {
          gymId,
          memberCode: `TEST-AC-${stamp}`,
          name: "Access Test",
          phone: `5${String(stamp).slice(-9)}`,
          passwordHash: "unused-in-this-test",
        },
      })
    ).id;
  });

  afterAll(async () => {
    await db.member.deleteMany({ where: { gymId } });
    await db.gym.deleteMany({ where: { id: { in: [gymId, otherGymId] } } });
  });

  it("lets an active member carry on", async () => {
    expect(await getMemberAccess(gymId, memberId)).toBe("OK");
  });

  it("stops a member the front desk switched off, and lets them back in when switched on again", async () => {
    await db.member.update({ where: { id: memberId }, data: { active: false } });
    expect(await getMemberAccess(gymId, memberId)).toBe("SUSPENDED");

    await db.member.update({ where: { id: memberId }, data: { active: true } });
    expect(await getMemberAccess(gymId, memberId)).toBe("OK");
  });

  it("does not care whether the membership has expired - that is for the front desk to chase, not a lock-out", async () => {
    await db.member.update({ where: { id: memberId }, data: { membershipEnd: new Date("2020-01-01T00:00:00Z") } });
    expect(await getMemberAccess(gymId, memberId)).toBe("OK");
  });

  it("treats a member that does not exist as gone", async () => {
    expect(await getMemberAccess(gymId, "no-such-member")).toBe("GONE");
  });

  it("treats a session for the wrong gym as gone", async () => {
    expect(await getMemberAccess(otherGymId, memberId)).toBe("GONE");
  });
});
