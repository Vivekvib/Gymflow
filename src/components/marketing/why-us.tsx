const REASONS = [
  {
    title: "A plan built for you",
    description: "Trainers set up your workout split and adjust it as you get stronger.",
  },
  {
    title: "See your own progress",
    description: "Log your weight and check your BMI trend any time from your phone.",
  },
  {
    title: "Membership you can check yourself",
    description: "Log in any time to see your exact expiry date and full payment history.",
  },
] as const;

export function WhyUs() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Why train with us</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {REASONS.map((reason) => (
          <div key={reason.title}>
            <h3 className="text-lg font-medium text-[var(--color-ink)]">{reason.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
