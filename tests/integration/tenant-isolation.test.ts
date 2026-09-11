import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { getMemberDetail, updateMember } from "@/modules/members/service";
import { NotFoundError } from "@/lib/errors";

/**
 * Requires DATABASE_URL to point at a real (test) Postgres database - run
 * `pnpm db:migrate` against it first. This does not run as part of a plain
 * `pnpm test` in an environment with no database configured; wire it into
 * CI once a disposable test database is available (see README's production
 * checklist).
 *
 * This is the one test the README calls out as non-negotiable: a member
 * from Gym A must never be readable or modifiable using a Gym B session.
 */
describe("tenant isolation", () => {
  let gymA: { id: string };
  let gymB: { id: string };
  let memberInGymA: { id: string };

  beforeAll(async () => {
    gymA = await db.gym.create({
      data: { name: "Tenant Test Gym A", slug: `test-gym-a-${Date.now()}` },
    });
    gymB = await db.gym.create({
      data: { name: "Tenant Test Gym B", slug: `test-gym-b-${Date.now()}` },
    });

    memberInGymA = await db.member.create({
      data: {
        gymId: gymA.id,
        memberCode: `TEST-${Date.now()}`,
        name: "Isolation Test Member",
        phone: `+91${Date.now()}`.slice(0, 13),
        passwordHash: "unused-in-this-test",
      },
    });
  });

  afterAll(async () => {
    await db.member.deleteMany({ where: { gymId: { in: [gymA.id, gymB.id] } } });
    await db.gym.deleteMany({ where: { id: { in: [gymA.id, gymB.id] } } });
  });

  it("never returns a member when queried with a different gym's ID", async () => {
    const result = await getMemberDetail(gymB.id, memberInGymA.id);
    expect(result).toBeNull();
  });

  it("still returns the member for the gym it actually belongs to", async () => {
    const result = await getMemberDetail(gymA.id, memberInGymA.id);
    expect(result?.id).toBe(memberInGymA.id);
  });

  it("refuses to update a member scoped to a different gym", async () => {
    await expect(
      updateMember(
        gymB.id,
        memberInGymA.id,
        { name: "Hijacked Name", phone: "+919999999999" },
        "irrelevant-admin-id",
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
