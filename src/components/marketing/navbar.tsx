import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface NavbarProps {
  gymName: string;
}

export function Navbar({ gymName }: NavbarProps) {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="truncate text-lg font-semibold text-[var(--color-ink)]">{gymName}</span>
        <nav className="flex shrink-0 items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] sm:inline"
          >
            Staff login
          </Link>
          <Link href="/member/login" className={buttonVariants({ variant: "secondary" })}>
            Member login
          </Link>
        </nav>
      </div>
    </header>
  );
}
