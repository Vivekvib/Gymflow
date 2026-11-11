import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { completeWorkoutDay, getWorkoutPlan, upsertWorkoutPlan } from "@/modules/workouts/service";
import type { WorkoutDayInput, WorkoutPlanInput } from "@/modules/workouts/validation";

/**
 * Needs DATABASE_URL pointing at a disposable Postgres with migrations
 * applied, like the other integration tests.
 *
 * Regression: once a member ticked a workout day, the admin could no longer
 * edit that member's plan - the save deleted every plan day, and the database
 * refused because a tick still pointed at one. The plan is now saved in place:
 * days that stay keep their identity (and their ticks), days that are removed
 * take their ticks with them.
 */
const exercise = (name: string) => ({ name, sets: 3, reps: "8-10", restSeconds: 60, notes: "" });
const day = (dayOfWeek: number, title: string, ...names: string[]): WorkoutDayInput => ({
  dayOfWeek,
  title,
  exercises: names.map(exercise),
});
const plan = (title: string, ...days: WorkoutDayInput[]): WorkoutPlanInput => ({ title, notes: "", days });

describe("editing a workout plan", () => {
  const stamp = Date.now();
  let gymId = "";
  let otherGymId = "";
  let adminId = "";
  let memberId = "";

  beforeAll(async () => {
    const gym = await db.gym.create({ data: { name: "Plan Edit Gym", slug: `test-pe-${stamp}` } });
    const other = await db.gym.create({ data: { name: "Plan Edit Other Gym", slug: `test-pe-other-${stamp}` } });
    gymId = gym.id;
    otherGymId = other.id;
    const admin = await db.admin.create({
      data: { gymId, name: "Plan Admin", email: `plan-admin-${stamp}@example.test`, passwordHash: "unused" },
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    const members = await db.member.findMany({ where: { gymId }, select: { id: true } });
    const memberIds = members.map((m) => m.id);
    await db.auditLog.deleteMany({ where: { gymId } });
    await db.workoutCompletion.deleteMany({ where: { memberId: { in: memberIds } } });
    await db.workoutPlan.deleteMany({ where: { gymId } });
    await db.member.deleteMany({ where: { gymId } });
    await db.admin.deleteMany({ where: { gymId } });
    await db.gym.deleteMany({ where: { id: { in: [gymId, otherGymId] } } });
  });

  let counter = 0;
  /** A fresh member with a saved Mon/Wed/Fri plan, so each test starts from the same place. */
  async function memberWithPlan() {
    counter += 1;
    const member = await db.member.create({
      data: {
        gymId,
        memberCode: `TEST-PE-${stamp}-${counter}`,
        name: `Plan Edit ${counter}`,
        phone: `6${String(stamp).slice(-8)}${counter}`,
        passwordHash: "unused-in-this-test",
      },
    });
    memberId = member.id;
    await upsertWorkoutPlan(gymId, member.id, plan("Starter", day(1, "Push", "Bench"), day(3, "Pull", "Row"), day(5, "Legs", "Squat")), adminId);
    const saved = await getWorkoutPlan(gymId, member.id);
    return { memberId: member.id, days: saved!.days };
  }

  const idByWeekday = (days: { id: string; dayOfWeek: number }[]) =>
    Object.fromEntries(days.map((d) => [d.dayOfWeek, d.id]));
  const ticks = (id: string) => db.workoutCompletion.count({ where: { memberId: id } });

  it("creates a plan with its days in order", async () => {
    const { days } = await memberWithPlan();
    expect(days.map((d) => [d.dayOfWeek, d.title, d.order])).toEqual([
      [1, "Push", 0],
      [3, "Pull", 1],
      [5, "Legs", 2],
    ]);
    expect(days[0]!.exercises.map((e) => e.name)).toEqual(["Bench"]);
  });

  it("can be edited after the member has ticked a day, and the tick survives", async () => {
    const { memberId: id, days } = await memberWithPlan();
    const before = idByWeekday(days);
    await completeWorkoutDay(gymId, id, before[1]!);
    await completeWorkoutDay(gymId, id, before[5]!);

    // Change a title and the exercises, keep all three days.
    await upsertWorkoutPlan(
      gymId,
      id,
      plan("Starter v2", day(1, "Chest day", "Bench", "Fly"), day(3, "Back day", "Row"), day(5, "Legs", "Squat", "Lunge")),
      adminId,
    );

    const after = await getWorkoutPlan(gymId, id);
    expect(after!.title).toBe("Starter v2");
    expect(idByWeekday(after!.days)).toEqual(before); // same rows, not recreated
    expect(after!.days.map((d) => d.title)).toEqual(["Chest day", "Back day", "Legs"]);
    expect(after!.days[0]!.exercises.map((e) => e.name)).toEqual(["Bench", "Fly"]);
    expect(await ticks(id)).toBe(2);
  });

  it("replaces a day's exercises, in the order submitted", async () => {
    const { memberId: id } = await memberWithPlan();
    await upsertWorkoutPlan(gymId, id, plan("Starter", day(1, "Push", "Dips", "Bench", "Fly"), day(3, "Pull", "Row"), day(5, "Legs", "Squat")), adminId);

    const after = await getWorkoutPlan(gymId, id);
    expect(after!.days[0]!.exercises.map((e) => [e.name, e.order])).toEqual([
      ["Dips", 0],
      ["Bench", 1],
      ["Fly", 2],
    ]);
    expect(await db.planExercise.count({ where: { workoutPlanDayId: after!.days[0]!.id } })).toBe(3);
  });

  it("removing a day deletes it and its ticks, and leaves the other days' ticks alone", async () => {
    const { memberId: id, days } = await memberWithPlan();
    const before = idByWeekday(days);
    await completeWorkoutDay(gymId, id, before[1]!);
    await completeWorkoutDay(gymId, id, before[3]!);

    // Drop Wednesday.
    await upsertWorkoutPlan(gymId, id, plan("Starter", day(1, "Push", "Bench"), day(5, "Legs", "Squat")), adminId);

    const after = await getWorkoutPlan(gymId, id);
    expect(after!.days.map((d) => d.dayOfWeek)).toEqual([1, 5]);
    expect(idByWeekday(after!.days)).toEqual({ 1: before[1], 5: before[5] });
    expect(await db.workoutPlanDay.count({ where: { id: before[3]! } })).toBe(0);
    expect(await db.planExercise.count({ where: { workoutPlanDayId: before[3]! } })).toBe(0);
    expect(await ticks(id)).toBe(1); // Monday's tick stays, Wednesday's went with its day
  });

  it("adds a day on a new weekday without touching the existing ones", async () => {
    const { memberId: id, days } = await memberWithPlan();
    const before = idByWeekday(days);
    await completeWorkoutDay(gymId, id, before[1]!);

    await upsertWorkoutPlan(
      gymId,
      id,
      plan("Starter", day(1, "Push", "Bench"), day(2, "Cardio", "Run"), day(3, "Pull", "Row"), day(5, "Legs", "Squat")),
      adminId,
    );

    const after = await getWorkoutPlan(gymId, id);
    expect(after!.days.map((d) => d.dayOfWeek)).toEqual([1, 2, 3, 5]);
    expect(after!.days.map((d) => d.order)).toEqual([0, 1, 2, 3]);
    expect(after!.days.find((d) => d.dayOfWeek === 1)!.id).toBe(before[1]);
    expect(after!.days.find((d) => d.dayOfWeek === 5)!.id).toBe(before[5]);
    expect(await ticks(id)).toBe(1);
  });

  it("keeps two sessions on the same weekday apart, first with first", async () => {
    counter += 1;
    const member = await db.member.create({
      data: {
        gymId,
        memberCode: `TEST-PE-${stamp}-${counter}`,
        name: `Plan Edit ${counter}`,
        phone: `6${String(stamp).slice(-8)}${counter}`,
        passwordHash: "unused-in-this-test",
      },
    });
    await upsertWorkoutPlan(gymId, member.id, plan("Doubles", day(1, "Morning", "Run"), day(1, "Evening", "Lift")), adminId);
    const first = await getWorkoutPlan(gymId, member.id);
    const [morningId, eveningId] = first!.days.map((d) => d.id);
    await completeWorkoutDay(gymId, member.id, eveningId!);

    // Both kept, renamed: the evening session's tick must stay on the second one.
    await upsertWorkoutPlan(gymId, member.id, plan("Doubles", day(1, "AM cardio", "Run"), day(1, "PM strength", "Lift")), adminId);
    const second = await getWorkoutPlan(gymId, member.id);
    expect(second!.days.map((d) => [d.id, d.title])).toEqual([
      [morningId, "AM cardio"],
      [eveningId, "PM strength"],
    ]);
    expect(await ticks(member.id)).toBe(1);

    // Down to one session on that weekday: the second goes, with its tick.
    await upsertWorkoutPlan(gymId, member.id, plan("Doubles", day(1, "AM cardio", "Run")), adminId);
    const third = await getWorkoutPlan(gymId, member.id);
    expect(third!.days.map((d) => d.id)).toEqual([morningId]);
    expect(await ticks(member.id)).toBe(0);
  });

  it("saves the same plan twice without changing anything", async () => {
    const { memberId: id, days } = await memberWithPlan();
    const before = idByWeekday(days);
    const same = plan("Starter", day(1, "Push", "Bench"), day(3, "Pull", "Row"), day(5, "Legs", "Squat"));
    await upsertWorkoutPlan(gymId, id, same, adminId);
    await upsertWorkoutPlan(gymId, id, same, adminId);
    const after = await getWorkoutPlan(gymId, id);
    expect(idByWeekday(after!.days)).toEqual(before);
    expect(await db.workoutPlan.count({ where: { gymId, memberId: id } })).toBe(1);
  });

  it("writes an audit entry saying whether the plan was created or updated", async () => {
    const { memberId: id } = await memberWithPlan();
    await upsertWorkoutPlan(gymId, id, plan("Again", day(1, "Push", "Bench")), adminId);
    const planRow = await db.workoutPlan.findFirstOrThrow({ where: { gymId, memberId: id } });
    const actions = await db.auditLog.findMany({
      where: { gymId, entityId: planRow.id },
      orderBy: { createdAt: "asc" },
      select: { action: true },
    });
    expect(actions.map((a) => a.action)).toEqual(["WORKOUT_PLAN_CREATED", "WORKOUT_PLAN_UPDATED"]);
  });

  it("will not touch a member of another gym", async () => {
    const { memberId: id } = await memberWithPlan();
    await expect(upsertWorkoutPlan(otherGymId, id, plan("Hijack", day(1, "Push", "Bench")), adminId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect((await getWorkoutPlan(gymId, id))!.title).not.toBe("Hijack");
  });
});
