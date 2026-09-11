import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * A native <select>, not a custom listbox - for a data-entry-heavy admin
 * tool, native selects give free keyboard/screen-reader support and mobile
 * OS pickers that a hand-rolled Radix listbox would have to re-implement.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 pr-9 text-sm text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]"
        aria-hidden="true"
      />
    </div>
  ),
);
Select.displayName = "Select";
