import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ eyebrow, children, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
        <span aria-hidden>+ </span>
        {eyebrow}
      </p>
      <h2 className={cn("mt-3 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl")}>
        {children}
      </h2>
    </div>
  );
}
