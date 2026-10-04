import Link from "next/link";

interface FooterProps {
  gymName: string;
}

export function Footer({ gymName }: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-line)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {gymName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/faq" className="hover:text-[var(--color-ink)]">
            FAQ
          </Link>
          <Link href="/privacy" className="hover:text-[var(--color-ink)]">
            Privacy policy
          </Link>
          <Link href="/member/login" className="hover:text-[var(--color-ink)]">
            Member login
          </Link>
          <Link href="/admin/login" className="hover:text-[var(--color-ink)]">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
