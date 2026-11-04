import type { Metadata } from "next";
import Link from "next/link";
import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { PublicPage } from "@/components/marketing/public-page";
import { Container } from "@/components/marketing/container";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { FaqItem } from "@/components/marketing/faq-item";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const gym = await getPublicGym();
  const gymName = gym?.name ?? siteConfig.name;
  const hasContactInfo = Boolean(gym?.phone || gym?.email);

  return (
    <PublicPage>
      <Navbar gymName={gymName} />

      <main>
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              <span aria-hidden>+ </span>
              FAQ
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Questions, answered
            </h1>
            <p className="mt-5 max-w-sm text-sm text-[var(--color-ink-muted)]">
              {hasContactInfo
                ? "Question about hours, pricing, or classes? Contact us using the details in the footer."
                : "Question about hours, pricing, or classes? Ask at the front desk."}
            </p>
          </div>

          <div className="lg:col-span-8">
            <FaqItem question="How do I check my membership status?">
            <p>
              Log in at the member portal with your member ID or phone number and your password.
              Your dashboard shows your current status and exact expiry date.
            </p>
          </FaqItem>

          <FaqItem question="If I renew before my membership expires, do I lose the remaining days?">
            <p>
              No. Your new payment extends your current expiry date - it never resets or
              shortens it, even if you pay a few days early.
            </p>
          </FaqItem>

          <FaqItem question="What payment methods are accepted?">
            <p>Cash, UPI, card, and bank transfer, recorded at the front desk when you pay.</p>
          </FaqItem>

          <FaqItem question="Can I see my payment history?">
            <p>Yes - your full payment history is visible from your member dashboard at any time.</p>
          </FaqItem>

          <FaqItem question="Do you offer personalized workout plans?">
            <p>
              Yes. Our trainers can build you a day-by-day plan you can view from your member
              login under Workouts.
            </p>
          </FaqItem>

          <FaqItem question="Can I track my weight and BMI?">
            <p>
              Yes. Log your weight from your member dashboard and your BMI is calculated
              automatically from your latest weight and height.
            </p>
          </FaqItem>

          <FaqItem question="I forgot my password. What do I do?">
            <p>
              Ask a staff member at the front desk - an admin can reset it for you from your
              member profile.
            </p>
          </FaqItem>

          <FaqItem question="How do I update my contact or emergency contact details?">
            <p>Log in and go to Profile. You can update your details there at any time.</p>
          </FaqItem>

          <FaqItem question="Is my personal information kept private?">
            <p>
              Yes - see our{" "}
              <Link href="/privacy" className="font-medium text-[var(--color-accent)] hover:underline">
                Privacy Policy
              </Link>{" "}
              for details on what we collect and how it&apos;s used.
            </p>
          </FaqItem>
          </div>
        </Container>
      </main>

      <Footer gymName={gymName} gym={gym} />
    </PublicPage>
  );
}
