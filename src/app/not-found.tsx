import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-semibold text-[var(--color-ink)]">Page not found</h1>
      <Link href="/" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
        Go home
      </Link>
    </div>
  );
}
