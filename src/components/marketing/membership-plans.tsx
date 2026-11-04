import { Check } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { MEMBERSHIP_PRICES_INR, plansCopy } from "@/config/marketing";
import { getPlanPriceLabel } from "@/lib/plan-pricing";
import { PLAN_DURATION_PRESETS } from "@/modules/payments/validation";

/**
 * One card per plan length, reusing PLAN_DURATION_PRESETS (the same list
 * the admin payment form offers) so this can't drift out of sync with what
 * is actually recordable. A price shows only if one is configured in
 * config/marketing.ts; otherwise the card says to ask at the front desk
 * rather than showing an invented number.
 */
export function MembershipPlans() {
  return (
    <section
      id="plans"
      className="scroll-mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper)] py-20 sm:py-28"
    >
      <Container>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={plansCopy.eyebrow}>{plansCopy.title}</SectionHeading>
          <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">{plansCopy.intro}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_DURATION_PRESETS.map((preset) => {
            const price = getPlanPriceLabel(preset.days, MEMBERSHIP_PRICES_INR);

            return (
              <article
                key={preset.days}
                className="flex flex-col rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8"
              >
                <h3 className="font-display text-2xl font-bold uppercase text-[var(--color-accent)]">
                  {preset.label}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{preset.days} days</p>

                <ul className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-6 text-sm">
                  {plansCopy.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[var(--color-ink)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <div className="border-t border-[var(--color-line)] pt-6">
                    {price ? (
                      <p className="font-display text-5xl font-bold">{price}</p>
                    ) : (
                      <p className="font-display text-2xl font-bold uppercase text-[var(--color-ink-muted)]">
                        Ask at the front desk
                      </p>
                    )}
                  </div>
                  <CtaLink href="/#contact" variant="outline" className="mt-6 w-full justify-between">
                    Ask about this plan
                  </CtaLink>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
