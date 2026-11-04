import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { DARK_PATTERN, PHOTO_SCRIM } from "@/components/marketing/photo-slot";
import { ctaCopy, marketingImages } from "@/config/marketing";

export function CtaBanner() {
  const photo = marketingImages.cta;

  return (
    <section className="relative isolate overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-paper)]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: photo ? `url(${photo})` : DARK_PATTERN }}
      />
      {photo ? (
        <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: PHOTO_SCRIM }} />
      ) : null}

      <Container className="py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {ctaCopy.headline}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[var(--color-ink-muted)]">{ctaCopy.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CtaLink href="/member/login">Member login</CtaLink>
          <CtaLink href="/faq" variant="outline">
            Read the FAQ
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
