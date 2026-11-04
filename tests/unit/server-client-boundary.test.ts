import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * In the Next.js App Router, a file without "use client" is a server
 * component, and a server component cannot attach an event handler
 * (onClick, onWheel, ...) to anything: functions can't cross to the
 * browser. The mistake only shows up at runtime, as a crash on whichever
 * page renders it, and neither the type checker nor the linter flags it -
 * which is how it once reached the Members page. This test catches it
 * statically instead.
 *
 * Form `action={...}` (Server Actions) is intentionally NOT matched: it is
 * allowed, and it doesn't start with "on".
 */

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return entry === "generated" ? [] : collectTsxFiles(path);
    }
    return path.endsWith(".tsx") ? [path] : [];
  });
}

function isClientComponent(source: string): boolean {
  const start = source.trimStart().slice(0, 40);
  return start.startsWith('"use client"') || start.startsWith("'use client'");
}

describe("server/client component boundary", () => {
  const files = collectTsxFiles(join(process.cwd(), "src"));

  it("finds the source files (guards against this test silently checking nothing)", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("no server component attaches an event handler", () => {
    const violations: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      if (isClientComponent(source)) continue;

      for (const match of source.matchAll(/\bon[A-Z][A-Za-z]+=\{/g)) {
        const line = source.slice(0, match.index).split("\n").length;
        violations.push(`${file.replace(process.cwd(), "")}:${line} ${match[0]}`);
      }
    }

    expect(violations, `Add "use client" to these files:\n${violations.join("\n")}`).toEqual([]);
  });
});
