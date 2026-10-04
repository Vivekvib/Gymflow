interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

/**
 * Native <details>/<summary> instead of a JS accordion component - it's
 * accessible and keyboard-operable for free, and needs no client-side
 * state or animation library to open/close.
 */
export function FaqItem({ question, children }: FaqItemProps) {
  return (
    <details className="group border-b border-[var(--color-line)] py-4">
      <summary className="cursor-pointer list-none text-base font-medium text-[var(--color-ink)] marker:content-none">
        <span className="flex items-center justify-between gap-4">
          {question}
          <span
            aria-hidden
            className="shrink-0 text-[var(--color-ink-muted)] transition-transform group-open:rotate-45"
          >
            +
          </span>
        </span>
      </summary>
      <div className="mt-2 text-sm text-[var(--color-ink-muted)]">{children}</div>
    </details>
  );
}
