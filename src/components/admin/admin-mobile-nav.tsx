"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

/**
 * The desktop sidebar (admin-sidebar.tsx) is hidden below the md
 * breakpoint, so without this an admin on a phone had no navigation at
 * all. Same items, same active-state logic, laid out as a scrollable tab
 * bar instead.
 */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 md:hidden">
      {adminNavItems.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-[var(--color-accent)] text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
