import { Container } from "@/components/marketing/container";
import { PhotoSlot } from "@/components/marketing/photo-slot";
import { aboutCopy, marketingImages } from "@/config/marketing";

/**
 * Large two-tone headline, then three numbered points. When both About
 * photos are configured they sit either side of the points (the layout in
 * the design); without them the points simply span the full width.
 */
export function About() {
  const { aboutLeft, aboutRight } = marketingImages;
  const hasPhotos = Boolean(aboutLeft && aboutRight);

  const points = aboutCopy.points.map((point, index) => (
    <li key={point.title} className="border-t border-[var(--color-line)] pt-5">
      <p className="font-display text-4xl font-bold text-[var(--color-accent)]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{point.title}</h3>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{point.description}</p>
    </li>
  ));

  return (
    <section id="about" className="scroll-mt-24 bg-[var(--color-paper)] py-20 sm:py-28">
      <Container>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            <span aria-hidden>+ </span>
            {aboutCopy.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-5xl font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span>{aboutCopy.headlineStrong}</span>
            <span className="text-[#6b6b67]">{aboutCopy.headlineMuted}</span>
          </h2>
        </div>

        {hasPhotos && aboutLeft && aboutRight ? (
          <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-center">
            <PhotoSlot src={aboutLeft} alt="Plate-loaded leg press machine on the gym floor" className="aspect-[4/5]" />
            <ul className="space-y-8">{points}</ul>
            <PhotoSlot src={aboutRight} alt="Two people at the gym's front desk" className="aspect-[4/5]" />
          </div>
        ) : (
          <ul className="mt-14 grid gap-8 md:grid-cols-3">{points}</ul>
        )}
      </Container>
    </section>
  );
}
