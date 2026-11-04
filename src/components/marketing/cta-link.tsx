import Link from "next/link";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CtaLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

/**
 * The call-to-action button from the design: a rounded-rectangle (not a
 * pill) with a small square holding a double chevron. Written for the dark
 * public theme - the outline variant uses white, not theme variables.
 */
export function CtaLink({ href, children, variant = "primary", className }: CtaLinkProps) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] py-1.5 pl-4 pr-1.5 text-sm font-semibold transition-colors",
        isPrimary
          ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:brightness-95"
          : "border border-white/40 text-white hover:border-white",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px]",
          isPrimary
            ? "bg-[var(--color-accent-ink)] text-[var(--color-accent)]"
            : "bg-white text-black",
        )}
      >
        <ChevronsRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
