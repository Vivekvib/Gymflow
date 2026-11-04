import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { DARK_PATTERN, PHOTO_SCRIM } from "@/components/marketing/photo-slot";
import { heroCopy, marketingImages } from "@/config/marketing";

interface HeroProps {
  gymName: string;
  /** Real city from the Gym row, shown only when the admin has set one. */
  city?: string | null;
}

export function Hero({ gymName, city }: HeroProps) {
  const photo = marketingImages.hero;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-paper)]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: photo ? `url(${photo})` : DARK_PATTERN }}
      />
      {photo ? (
        <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: PHOTO_SCRIM }} />
      ) : null}

      <Container className="flex min-h-[85svh] flex-col justify-end gap-10 pb-12 pt-32 sm:pb-16 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            {gymName}
            {city ? `, ${city}` : ""}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            {heroCopy.headlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div className="max-w-md lg:pb-3">
          <p className="text-base text-[var(--color-ink-muted)] sm:text-lg">{heroCopy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CtaLink href="/#plans">See membership plans</CtaLink>
            <CtaLink href="/member/login" variant="outline">
              Member login
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
