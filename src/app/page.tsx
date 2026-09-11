import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

/**
 * Deliberately minimal for now - this pass prioritized auth, member CRUD,
 * and payments (the "replace the notebook" core). The full premium landing
 * page (hero, facilities, membership plans, testimonials) described in the
 * README is the next slice of work; this page is a working placeholder,
 * not a stand-in for it.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-paper)] px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{siteConfig.name}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {siteConfig.phone} - {siteConfig.email}
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/member/login" className={buttonVariants({ variant: "primary" })}>
          Member sign in
        </Link>
        <Link href="/admin/login" className={buttonVariants({ variant: "secondary" })}>
          Admin sign in
        </Link>
      </div>
    </main>
  );
}
