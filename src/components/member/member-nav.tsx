"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Dumbbell, Home, TrendingUp, User } from "lucide-react";
import { memberNavItems, type MemberNavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

const ICONS: Record<MemberNavItem["icon"], React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  home: Home,
  workouts: Dumbbell,
  progress: TrendingUp,
  bmi: Calculator,
  profile: User,
};

function isActivePath(pathname: string, href: string): boolean {
  return href === "/member" ? pathname === "/member" : pathname.startsWith(href);
}

/**
 * Two layouts for the same five pages. Phones get a tab bar fixed to the
 * bottom of the screen, where a thumb reaches; from `sm` up it's the familiar
 * row of tabs under the header.
 */
export function MemberNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Member pages"
        className="hidden border-b border-[var(--color-line)] bg-[var(--color-surface)] sm:block"
      >
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-6 lg:px-10">
          {memberNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                isActivePath(pathname, item.href)
                  ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                  : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <nav
        aria-label="Member pages"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {memberNavItems.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    active ? "text-[var(--color-accent)]" : "text-[var(--color-ink-muted)]",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
