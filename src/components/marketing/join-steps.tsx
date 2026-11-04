import { Container } from "@/components/marketing/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { joinCopy } from "@/config/marketing";

/**
 * Stands where the design has testimonials. There are no real member
 * reviews to show, and invented ones would be fake social proof, so this
 * explains how joining actually works instead.
 */
export function JoinSteps() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper)] py-20 sm:py-28"
    >
      <Container>
        <SectionHeading eyebrow={joinCopy.eyebrow}>{joinCopy.title}</SectionHeading>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {joinCopy.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:p-8"
            >
              <p className="font-display text-6xl font-bold text-[var(--color-accent)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-6 font-display text-2xl font-bold uppercase">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
