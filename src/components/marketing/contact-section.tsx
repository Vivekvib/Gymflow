import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { Gym } from "@/generated/prisma/client";

interface ContactSectionProps {
  gym: Pick<Gym, "phone" | "email" | "address" | "city"> | null;
}

export function ContactSection({ gym }: ContactSectionProps) {
  const fullAddress = [gym?.address, gym?.city].filter(Boolean).join(", ");
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  const rows = [
    fullAddress ? { key: "address", Icon: MapPin, label: fullAddress, href: mapsUrl, hint: "Open in Maps" } : null,
    gym?.phone ? { key: "phone", Icon: Phone, label: gym.phone, href: `tel:${gym.phone}`, hint: "Call" } : null,
    gym?.email ? { key: "email", Icon: Mail, label: gym.email, href: `mailto:${gym.email}`, hint: "Email" } : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-[var(--color-line)] bg-[var(--color-paper)] py-20 sm:py-28"
    >
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading eyebrow="Contact">Visit us</SectionHeading>
          <p className="mt-5 max-w-md text-sm text-[var(--color-ink-muted)]">
            Come in to join, ask about plans, or have a trainer set up your workout plan.
          </p>
        </div>

        {rows.length > 0 ? (
          <ul className="space-y-3">
            {rows.map(({ key, Icon, label, href, hint }) => (
              <li key={key}>
                <a
                  href={href ?? undefined}
                  {...(key === "address" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex min-h-16 items-center gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[var(--color-paper)] text-[var(--color-accent)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 break-words text-sm font-medium">{label}</span>
                  <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">{hint}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--color-line)] p-6 text-sm text-[var(--color-ink-muted)]">
            Contact details haven&apos;t been added yet. An admin can add them under Settings.
          </p>
        )}
      </Container>
    </section>
  );
}
