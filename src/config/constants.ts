/**
 * A membership is "expiring soon" - badge, Renew prompts and the renewals
 * list all use this one window - when this many days or fewer are left,
 * counting today. See modules/membership/state.ts.
 */
export const EXPIRING_SOON_DAYS = 7;

/** A lapsed membership stays on the renewals-due list for this many days. */
export const RENEWAL_LAPSED_LOOKBACK_DAYS = 30;

/** Rows per page on the admin members list. */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * "Ending within N days" counts on the admin dashboard, and the `within`
 * values the members list accepts when opened from them.
 */
export const DASHBOARD_EXPIRY_WINDOWS = [7, 15, 30] as const;

/**
 * Options passed to every `db.$transaction(...)` call. Prisma's defaults
 * (maxWait: 2000ms, timeout: 5000ms) assume an always-on database. Serverless
 * Postgres providers that scale to zero when idle (Neon, Supabase's pooler)
 * can take several seconds to wake a suspended compute back up before the
 * very first connection succeeds - well past that 2-second default - which
 * surfaces as Prisma error P2028 ("Transaction API error: Unable to start a
 * transaction in the given time"). These wider values are harmless against
 * an always-on database too; they just add patience, never removed pressure.
 */
export const DB_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 15_000,
} as const;
