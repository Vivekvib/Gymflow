import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { footerBlurb } from "@/config/marketing";
import type { Gym } from "@/generated/prisma/client";

interface FooterProps {
  gymName: string;
  gym?: Pick<Gym, "phone" | "email" | "address" | "city"> | null;
}

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "About", href: "/#about" },
      { label: "Training", href: "/#services" },
      { label: "Membership plans", href: "/#plans" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    heading: "Members",
    links: [
      { label: "Member login", href: "/member/login" },
      { label: "Staff login", href: "/admin/login" },
    ],
  },
  {
    heading: "Info",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

export function Footer({ gymName, gym }: FooterProps) {
  const fullAddress = [gym?.address, gym?.city].filter(Boolean).join(", ");

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <p className="font-display text-3xl font-bold uppercase leading-none tracking-tight">{gymName}</p>
          <p className="mt-4 max-w-sm text-sm text-[var(--color-ink-muted)]">{footerBlurb}</p>
          <div className="mt-6 space-y-1 text-sm text-[var(--color-ink-muted)]">
            {fullAddress ? <p>{fullAddress}</p> : null}
            {gym?.phone ? <p>{gym.phone}</p> : null}
            {gym?.email ? <p>{gym.email}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-t border-[var(--color-line)]">
        <Container className="py-5 text-xs text-[var(--color-ink-muted)]">
          &copy; {new Date().getFullYear()} {gymName}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
