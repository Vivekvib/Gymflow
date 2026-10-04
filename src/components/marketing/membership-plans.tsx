import { PLAN_DURATION_PRESETS } from "@/modules/payments/validation";

/**
 * Deliberately shows durations, not prices - the app has no stored "plan
 * price" anywhere (an admin enters the amount by hand when recording a
 * payment), so showing a specific number here risks it not matching what
 * the gym actually charges. Reuses the same PLAN_DURATION_PRESETS the
 * admin payment form offers, so this list can never drift out of sync
 * with what's actually recordable.
 */
export function MembershipPlans() {
  return (
    <section id="plans" className="bg-[var(--color-paper)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Membership plans</h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-muted)]">
          Pick whatever length works for you - ask at the front desk for current pricing.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_DURATION_PRESETS.map((preset) => (
            <div
              key={preset.days}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
            >
              <p className="text-sm text-[var(--color-ink-muted)]">{preset.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{preset.days} days</p>
              <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
                Full gym access, progress tracking, and a workout plan from our trainers.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
