import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { cn } from "@/lib/utils";

interface NavbarProps {
  gymName: string;
  /** On the landing page the bar floats over the hero; elsewhere it is a normal bar. */
  overlay?: boolean;
}

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Training", href: "/#services" },
  { label: "Plans", href: "/#plans" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/#contact" },
];

const MOBILE_LINKS = [
  ...NAV_LINKS,
  { label: "Member login", href: "/member/login" },
  { label: "Staff login", href: "/admin/login" },
];

export function Navbar({ gymName, overlay = false }: NavbarProps) {
  return (
    <header
      className={cn(
        "z-30 w-full",
        overlay
          ? "absolute inset-x-0 top-0"
          : "relative border-b border-[var(--color-line)] bg-[var(--color-paper)]",
      )}
    >
      <Container className="flex items-center justify-between gap-6 py-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-display text-2xl font-bold uppercase tracking-tight text-[var(--color-ink)]"
        >
          <Dumbbell className="h-6 w-6 shrink-0 text-[var(--color-accent)]" aria-hidden />
          <span className="truncate">{gymName}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/admin/login"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Staff login
          </Link>
          <CtaLink href="/member/login" variant="outline">
            Member login
          </CtaLink>
        </div>

        <MobileMenu links={MOBILE_LINKS} />
      </Container>
    </header>
  );
}
