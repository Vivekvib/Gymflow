import type { Gym } from "@/generated/prisma/client";

interface ContactSectionProps {
  gym: Pick<Gym, "phone" | "email" | "address" | "city"> | null;
}

export function ContactSection({ gym }: ContactSectionProps) {
  const hasAnyContactInfo = Boolean(gym?.address || gym?.phone || gym?.email);

  return (
    <section className="border-t border-[var(--color-line)] bg-[var(--color-paper)] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Visit us</h2>
        <div className="mt-4 space-y-1 text-sm text-[var(--color-ink-muted)]">
          {gym?.address ? (
            <p>
              {gym.address}
              {gym.city ? `, ${gym.city}` : ""}
            </p>
          ) : null}
          {gym?.phone ? <p>{gym.phone}</p> : null}
          {gym?.email ? <p>{gym.email}</p> : null}
          {!hasAnyContactInfo ? (
            <p>Contact details haven&apos;t been added yet - an admin can add them under Settings.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
