import { Dumbbell, HeartPulse, Users } from "lucide-react";

const FACILITIES = [
  {
    icon: Dumbbell,
    title: "Strength training",
    description: "A full range of free weights, plates, and machines for every level.",
  },
  {
    icon: HeartPulse,
    title: "Cardio zone",
    description: "Treadmills, bikes, and rowers, with enough space to actually move.",
  },
  {
    icon: Users,
    title: "Coaching",
    description: "Trainers who build you a plan and check in on how it's going.",
  },
] as const;

export function Facilities() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">What you&apos;ll find here</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {FACILITIES.map((facility) => (
          <div key={facility.title} className="rounded-lg border border-[var(--color-line)] p-6">
            <facility.icon className="h-8 w-8 text-[var(--color-accent)]" aria-hidden />
            <h3 className="mt-4 text-lg font-medium text-[var(--color-ink)]">{facility.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{facility.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
