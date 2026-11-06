import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { completeWorkoutDay, getWorkoutOverview, undoWorkoutDay } from "@/modules/workouts/service";

/**
 * Needs DATABASE_URL pointing at a disposable Postgres with migrations
 * applied, like tenant-isolation.test.ts.
 *
 * Ticking off a workout takes a plan-day ID from the browser. The IDs are
 * never trusted: a member may only tick days of their own plan, and never
 * across gyms. These tests are what stops one member marking another
 * member's workouts as done by sending a different ID.
 */
describe("workout completion", () => {
  const stamp = Date.now();
  let gymA: { id: string };
  let gymB: { id: string };
  let alice: { id: string };
  let bob: { id: string };
  let carol: { id: string }; // in gym B
  let aliceDayId: string;
  let bobDayId: string;

  async function createMemberWithPlan(gymId: string, label: string, index: number) {
    const member = await db.member.create({
      data: {
        gymId,
        memberCode: `TEST-WC-${stamp}-${index}`,
        name: `Completion Test ${label}`,
        phone: `7${String(stamp).slice(-8)}${index}`,
        passwordHash: "unused-in-this-test",
      },
    });
    const plan = await db.workoutPlan.create({
      data: {
        gymId,
        memberId: member.id,
        title: `${label}'s plan`,
        days: {
          create: [
            {
              dayOfWeek: 1,
              title: "Push",
              order: 0,
              exercises: { create: [{ name: "Bench Press", sets: 3, reps: "8", restSeconds: 60, order: 0 }] },
            },
          ],
        },
      },
      include: { days: true },
    });
    return { member, dayId: plan.days[0]!.id };
  }

  beforeAll(async () => {
    gymA = await db.gym.create({ data: { name: "Completion Gym A", slug: `test-wc-a-${stamp}` } });
    gymB = await db.gym.create({ data: { name: "Completion Gym B", slug: `test-wc-b-${stamp}` } });

    const a = await createMemberWithPlan(gymA.id, "Alice", 1);
    const b = await createMemberWithPlan(gymA.id, "Bob", 2);
    const c = await createMemberWithPlan(gymB.id, "Carol", 3);
    alice = a.member;
    bob = b.member;
    carol = c.member;
    aliceDayId = a.dayId;
    bobDayId = b.dayId;
  });

  afterAll(async () => {
    const memberIds = [alice.id, bob.id, carol.id];
    await db.workoutCompletion.deleteMany({ where: { memberId: { in: memberIds } } });
    await db.workoutPlan.deleteMany({ where: { memberId: { in: memberIds } } });
    await db.member.deleteMany({ where: { gymId: { in: [gymA.id, gymB.id] } } });
    await db.gym.deleteMany({ where: { id: { in: [gymA.id, gymB.id] } } });
  });

  const completionCount = (memberId: string) => db.workoutCompletion.count({ where: { memberId } });

  it("lets a member tick off a day of their own plan", async () => {
    await completeWorkoutDay(gymA.id, alice.id, aliceDayId);

    expect(await completionCount(alice.id)).toBe(1);
    const overview = await getWorkoutOverview(gymA.id, alice.id);
    expect(overview?.doneToday.has(aliceDayId)).toBe(true);
    expect(overview?.doneThisWeek.has(aliceDayId)).toBe(true);
  });

  it("records a double tap only once", async () => {
    await completeWorkoutDay(gymA.id, alice.id, aliceDayId);
    await completeWorkoutDay(gymA.id, alice.id, aliceDayId);

    expect(await completionCount(alice.id)).toBe(1);
  });

  it("undoes today's tick", async () => {
    await undoWorkoutDay(gymA.id, alice.id, aliceDayId);

    expect(await completionCount(alice.id)).toBe(0);
    const overview = await getWorkoutOverview(gymA.id, alice.id);
    expect(overview?.doneToday.has(aliceDayId)).toBe(false);
  });

  it("refuses a day that belongs to another member of the same gym", async () => {
    await expect(completeWorkoutDay(gymA.id, alice.id, bobDayId)).rejects.toBeInstanceOf(NotFoundError);

    expect(await completionCount(alice.id)).toBe(0);
    expect(await completionCount(bob.id)).toBe(0);
  });

  it("refuses to undo another member's tick", async () => {
    await completeWorkoutDay(gymA.id, bob.id, bobDayId);

    await expect(undoWorkoutDay(gymA.id, alice.id, bobDayId)).rejects.toBeInstanceOf(NotFoundError);
    expect(await completionCount(bob.id)).toBe(1);
  });

  it("refuses a day from a different gym", async () => {
    // Carol is in gym B; Alice's session (gym A) must not reach her plan, and the other way round.
    await expect(completeWorkoutDay(gymA.id, carol.id, aliceDayId)).rejects.toBeInstanceOf(NotFoundError);
    await expect(completeWorkoutDay(gymB.id, alice.id, aliceDayId)).rejects.toBeInstanceOf(NotFoundError);

    expect(await completionCount(carol.id)).toBe(0);
  });
});
