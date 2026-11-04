import * as React from "react";

/**
 * Page wrapper for the public site and sign-in pages. The black theme is now
 * global (see globals.css), so this only provides the full-height page
 * surface; it no longer switches any theme on.
 */
export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">{children}</div>
  );
}
