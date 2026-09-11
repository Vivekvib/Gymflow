import { addDays as addDaysFns, differenceInCalendarDays, format, isAfter, isBefore } from "date-fns";

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

/** e.g. "9 Sep 2026" - used across admin/member UI for consistency. */
export function formatDate(date: Date): string {
  return format(date, "d MMM yyyy");
}

/** e.g. "9 Sep 2026, 8:30 am" - used for payment/attendance timestamps. */
export function formatDateTime(date: Date): string {
  return format(date, "d MMM yyyy, h:mm a");
}

export function daysUntil(date: Date): number {
  return differenceInCalendarDays(date, new Date());
}
