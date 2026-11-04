"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileMenuProps {
  links: { label: string; href: string }[];
}

/**
 * The only client component in the public navbar. Closes itself when a link
 * is chosen, which matters for in-page anchors (/#plans) where navigation
 * doesn't reload the page.
 */
export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-white/30 text-white"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-y border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-3 sm:px-8"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href} className="border-b border-[var(--color-line)] last:border-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-base font-medium text-[var(--color-ink)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
