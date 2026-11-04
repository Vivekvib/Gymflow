"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memberNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-10">
      {memberNavItems.map((item) => {
        const isActive = item.href === "/member" ? pathname === "/member" : pathname.startsWith(item.href);
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
      </div>
    </nav>
  );
}
