import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  lastMonthStarts,
  startOfZonedDay,
  startOfZonedMonth,
  startOfZonedWeek,
  zonedDayOfWeek,
  zonedDaysUntil,
} from "@/lib/dates";

const IST = "Asia/Kolkata";

describe("gym-timezone date boundaries (IST)", () => {
  it("starts the day at 00:00 IST even when the server clock is still on the previous UTC day", () => {
    // 02:00 IST on 5 Nov is 20:30 UTC on 4 Nov.
    const lateNight = new Date("2026-11-04T20:30:00Z");
    expect(startOfZonedDay(lateNight, IST).toISOString()).toBe("2026-11-04T18:30:00.000Z");
  });

  it("starts the day at 00:00 IST for a daytime moment", () => {
    expect(startOfZonedDay(new Date("2026-11-04T07:00:00Z"), IST).toISOString()).toBe(
      "2026-11-03T18:30:00.000Z",
    );
  });

  it("starts the month at 00:00 IST on the 1st", () => {
    expect(startOfZonedMonth(new Date("2026-11-04T10:00:00Z"), IST).toISOString()).toBe(
      "2026-10-31T18:30:00.000Z",
    );
  });

  it("puts a payment made at 00:30 IST on 1 Dec into December, not November", () => {
    // 00:30 IST on 1 Dec = 19:00 UTC on 30 Nov.
    const payment = new Date("2026-11-30T19:00:00Z");
    expect(startOfZonedMonth(payment, IST).toISOString()).toBe("2026-11-30T18:30:00.000Z");
  });

  it("starts the week on Monday", () => {
    // Wed 4 Nov 2026 -> Monday 2 Nov 2026, 00:00 IST.
    expect(startOfZonedWeek(new Date("2026-11-04T07:00:00Z"), IST).toISOString()).toBe(
      "2026-11-01T18:30:00.000Z",
    );
    // Sunday still belongs to the week that began the previous Monday.
    expect(startOfZonedWeek(new Date("2026-11-08T07:00:00Z"), IST).toISOString()).toBe(
      "2026-11-01T18:30:00.000Z",
    );
  });

  it("reports the weekday in the gym's timezone", () => {
    expect(zonedDayOfWeek(new Date("2026-11-04T07:00:00Z"), IST)).toBe(3); // Wednesday
    // 01:00 IST Thursday is still Wednesday in UTC.
    expect(zonedDayOfWeek(new Date("2026-11-04T19:30:00Z"), IST)).toBe(4);
  });
});

describe("lastMonthStarts", () => {
  it("returns the last six months oldest first, ending with the current month", () => {
    const months = lastMonthStarts(new Date("2026-11-04T07:00:00Z"), 6, IST);
    expect(months.map((month) => month.label)).toEqual(["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]);
    expect(months.map((month) => month.key)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
  });

  it("rolls back across a year boundary", () => {
    const months = lastMonthStarts(new Date("2027-02-10T07:00:00Z"), 4, IST);
    expect(months.map((month) => month.key)).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
  });

  it("makes each month end exactly where the next begins", () => {
    const months = lastMonthStarts(new Date("2026-11-04T07:00:00Z"), 6, IST);
    for (let i = 0; i < months.length - 1; i += 1) {
      expect(months[i]?.end.getTime()).toBe(months[i + 1]?.start.getTime());
    }
  });
});

describe("formatting in the gym's timezone", () => {
  it("shows the IST date, not the UTC one, for an early-morning payment", () => {
    // 01:00 IST on 12 Dec is 19:30 UTC on 11 Dec.
    expect(formatDate(new Date("2026-12-11T19:30:00Z"))).toBe("12 Dec 2026");
  });

  it("formats date and time like the rest of the app", () => {
    expect(formatDateTime(new Date("2026-09-09T03:00:00Z"))).toBe("9 Sep 2026, 8:30 am");
    expect(formatDateTime(new Date("2026-09-09T13:05:00Z"))).toBe("9 Sep 2026, 6:35 pm");
  });
});

describe("zonedDaysUntil", () => {
  const now = new Date("2026-11-04T07:00:00Z"); // 12:30 IST on 4 Nov

  it("counts calendar days on the gym's calendar", () => {
    expect(zonedDaysUntil(new Date("2026-11-04T16:00:00Z"), IST, now)).toBe(0); // 21:30 IST, same day
    expect(zonedDaysUntil(new Date("2026-11-11T07:00:00Z"), IST, now)).toBe(7);
  });

  it("goes negative once the date has passed", () => {
    expect(zonedDaysUntil(new Date("2026-11-01T07:00:00Z"), IST, now)).toBe(-3);
  });

  it("treats a moment after IST midnight as the next day even though UTC says otherwise", () => {
    // 00:30 IST on 5 Nov = 19:00 UTC on 4 Nov
    expect(zonedDaysUntil(new Date("2026-11-04T19:00:00Z"), IST, now)).toBe(1);
  });
});
