import { ClipboardList, Dumbbell, HeartPulse, TrendingUp } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PHOTO_SCRIM } from "@/components/marketing/photo-slot";
import { marketingImages, servicesCopy } from "@/config/marketing";

const ICONS = {
  "clipboard-list": ClipboardList,
  dumbbell: Dumbbell,
  "heart-pulse": HeartPulse,
  "trending-up": TrendingUp,
} as const;

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper)] py-20 sm:py-28"
    >
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={servicesCopy.eyebrow}>{servicesCopy.title}</SectionHeading>
          <div className="max-w-sm">
            <p className="text-sm text-[var(--color-ink-muted)]">{servicesCopy.intro}</p>
            <CtaLink href="/#plans" variant="outline" className="mt-5">
              See membership plans
            </CtaLink>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {servicesCopy.items.map((item) => {
            const Icon = ICONS[item.icon];
            const photo = marketingImages.services[item.key];

            return (
              <article
                key={item.key}
                className="relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] bg-cover bg-center p-6"
                style={photo ? { backgroundImage: `url(${photo})` } : undefined}
              >
                {photo ? (
                  <div aria-hidden className="absolute inset-0" style={{ backgroundImage: PHOTO_SCRIM }} />
                ) : (
                  <Icon className="absolute left-6 top-6 h-10 w-10 text-[var(--color-accent)]" aria-hidden />
                )}
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold uppercase text-[var(--color-accent)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
