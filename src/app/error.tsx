"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-semibold text-[var(--color-ink)]">Something went wrong</h1>
      <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">
        Please try again, or contact the gym if this keeps happening.
        {error.digest ? ` (ref: ${error.digest})` : null}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
