import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface HeroProps {
  gymName: string;
  /** Real city from the Gym row, shown only when the admin has set one. */
  city?: string | null;
}

export function Hero({ gymName, city }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-[var(--color-accent)] opacity-15 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {gymName}
          </h1>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Free weights, cardio, and coaches who actually watch your form. Join, train, and
            track your own progress week to week.
          </p>
          {city ? <p className="mt-2 text-sm text-white/50">{city}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/member/login" className={buttonVariants({ size: "lg" })}>
              Member sign in
            </Link>
            <Link href="#plans" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              See membership plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
