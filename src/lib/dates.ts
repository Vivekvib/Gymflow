import { addDays as addDaysFns, differenceInCalendarDays, isAfter, isBefore } from "date-fns";

export function addDays(base: Date, days: number): Date {
  return addDaysFns(base, days);
}

/**
 * True when `date` is strictly before the current moment - i.e. an expiry
 * date has already passed.
 */
export function isPast(date: Date): boolean {
  return isBefore(date, new Date());
}

/**
 * True when `date` is still in the future and no more than `days` away.
 * Used for "expiring in 7/15/30 days" dashboard buckets.
 */
export function isWithinNextDays(date: Date, days: number): boolean {
  const now = new Date();
  if (isBefore(date, now)) return false;
  return differenceInCalendarDays(date, now) <= days;
}

export function isFuture(date: Date): boolean {
  return isAfter(date, new Date());
}

/**
 * e.g. "9 Sep 2026" - used across admin/member UI for consistency. Shown in
 * the gym's timezone (IST), not the server's (UTC on Vercel), so a payment
 * taken at 1am doesn't display as the previous day.
 */
export function formatDate(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}`;
}

/** e.g. "9 Sep 2026, 8:30 am" - used for payment/attendance timestamps. */
export function formatDateTime(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${formatDate(date, timeZone)}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toLowerCase()}`;
}

export function daysUntil(date: Date): number {
  return differenceInCalendarDays(date, new Date());
}

// ---------------------------------------------------------------------------
// Gym-timezone helpers
//
// The server runs in UTC (Vercel) while the gym lives in IST, so "today" and
// "this month" computed with `new Date(y, m, d)` start at 05:30 IST instead of
// midnight, and a payment taken at 2am lands on the wrong day. These helpers
// compute the day / week / month boundaries in the gym's own timezone.
// ---------------------------------------------------------------------------

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0 = Sunday .. 6 = Saturday
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
  };
}

/** How far the timezone's wall clock is ahead of UTC at this instant, in ms. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The UTC instant at which the wall clock in `timeZone` reads 00:00 on this calendar day. */
function zonedMidnightToUtc(year: number, month: number, day: number, timeZone: string): Date {
  const guess = Date.UTC(year, month - 1, day);
  const firstPass = guess - zoneOffsetMs(new Date(guess), timeZone);
  // A second pass settles the answer when the offset differs at the guessed instant (DST zones).
  return new Date(guess - zoneOffsetMs(new Date(firstPass), timeZone));
}

export function startOfZonedDay(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const { year, month, day } = zonedParts(date, timeZone);
  return zonedMidnightToUtc(year, month, day, timeZone);
}

export function startOfZonedMonth(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const { year, month } = zonedParts(date, timeZone);
  return zonedMidnightToUtc(year, month, 1, timeZone);
}

/** Monday 00:00 of the week containing `date`, in the gym's timezone. */
export function startOfZonedWeek(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const { year, month, day, weekday } = zonedParts(date, timeZone);
  const daysSinceMonday = (weekday + 6) % 7;
  return zonedMidnightToUtc(year, month, day - daysSinceMonday, timeZone);
}

/** 0 = Sunday .. 6 = Saturday, matching WorkoutPlanDay.dayOfWeek. */
export function zonedDayOfWeek(date: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  return zonedParts(date, timeZone).weekday;
}

/**
 * The start of each of the last `count` months (oldest first, current month
 * last), with a short label like "Nov".
 */
export function lastMonthStarts(
  now: Date,
  count: number,
  timeZone: string = DEFAULT_TIMEZONE,
): { start: Date; end: Date; label: string; key: string }[] {
  const { year, month } = zonedParts(now, timeZone);
  const labelFormat = new Intl.DateTimeFormat("en-US", { timeZone, month: "short" });

  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    // Month arithmetic through a plain UTC date, so Jan - 1 rolls into the previous Dec.
    const first = new Date(Date.UTC(year, month - 1 - offset, 1));
    const next = new Date(Date.UTC(year, month - offset, 1));
    const start = zonedMidnightToUtc(first.getUTCFullYear(), first.getUTCMonth() + 1, 1, timeZone);
    const end = zonedMidnightToUtc(next.getUTCFullYear(), next.getUTCMonth() + 1, 1, timeZone);
    return {
      start,
      end,
      label: labelFormat.format(start),
      key: `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, "0")}`,
    };
  });
}

/**
 * Whole calendar days from today to `date`, counted on the gym's calendar.
 * 0 means it happens today, negative means it already did.
 */
export function zonedDaysUntil(date: Date, timeZone: string = DEFAULT_TIMEZONE, now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (startOfZonedDay(date, timeZone).getTime() - startOfZonedDay(now, timeZone).getTime()) / msPerDay,
  );
}
