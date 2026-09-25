"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  gymName: string;
}

export function AdminSidebar({ gymName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] md:block">
      <div className="border-b border-[var(--color-line)] px-4 py-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">{gymName}</p>
        <p className="text-xs text-[var(--color-ink-muted)]">Admin console</p>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
