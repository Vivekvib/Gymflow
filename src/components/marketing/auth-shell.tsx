import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { PublicPage } from "@/components/marketing/public-page";
import { DARK_PATTERN } from "@/components/marketing/photo-slot";

interface AuthShellProps {
  gymName: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  alternate: { text: string; label: string; href: string };
}

/**
 * Split-screen layout for the sign-in pages: a brand panel on wide screens,
 * the form on every screen. Replaces the small centered card that left most
 * of a wide screen empty.
 */
export function AuthShell({ gymName, title, subtitle, children, alternate }: AuthShellProps) {
  return (
    <PublicPage>
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside
          className="hidden flex-col justify-between border-r border-[var(--color-line)] p-12 lg:flex xl:p-16"
          style={{ backgroundImage: DARK_PATTERN }}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-2xl font-bold uppercase tracking-tight"
          >
            <Dumbbell className="h-6 w-6 text-[var(--color-accent)]" aria-hidden />
            {gymName}
          </Link>

          <div>
            <p className="font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight xl:text-7xl">
              <span className="block">Train with</span>
              <span className="block">a plan.</span>
            </p>
            <p className="mt-5 max-w-sm text-sm text-[var(--color-ink-muted)]">
              Sign in to follow your workout plan, track your progress, and check your
              membership.
            </p>
          </div>

          <p className="text-xs text-[var(--color-ink-muted)]">
            &copy; {new Date().getFullYear()} {gymName}
          </p>
        </aside>

        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to website
            </Link>

            <p className="mb-2 text-sm font-semibold text-[var(--color-accent)] lg:hidden">{gymName}</p>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-sm text-[var(--color-ink-muted)]">
              {alternate.text}{" "}
              <Link href={alternate.href} className="font-medium text-[var(--color-accent)] hover:underline">
                {alternate.label}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
