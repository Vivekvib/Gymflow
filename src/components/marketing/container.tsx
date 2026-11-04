import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The page width for the public site. Wide on purpose (1600px, generous side
 * padding that grows with the screen) so content uses the screen instead of
 * sitting in a narrow column in the middle. Section *backgrounds* are
 * full-bleed; only the content inside is constrained, and only on very large
 * monitors.
 */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-16", className)} {...props} />
  );
}
