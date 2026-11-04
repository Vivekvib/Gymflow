"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * A client component because it attaches an onWheel handler. Server
 * components (e.g. the members list's search box) can still render it - the
 * props they pass are plain data. Without the directive above, rendering it
 * from a server component crashes with "Event handlers cannot be passed to
 * Client Component props" (tests/unit/server-client-boundary.test.ts guards
 * against that).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, min, onWheel, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      // Nothing in this app takes a negative number (weights, heights,
      // measurements, sets, rest, amounts), so number fields default to a
      // minimum of 0. Pass `min` explicitly where the floor is higher.
      min={type === "number" ? (min ?? 0) : min}
      onWheel={(event) => {
        // Browsers change a focused number field's value when you scroll or
        // two-finger drag over it, which silently swings values wildly (and
        // negative). Dropping focus on wheel stops that while the page still
        // scrolls normally. Keyboard arrows still work, deliberately.
        if (type === "number") event.currentTarget.blur();
        onWheel?.(event);
      }}
      className={cn(
        "h-10 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
