import type { Metadata } from "next";
import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { FaqItem } from "@/components/marketing/faq-item";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const gym = await getPublicGym();
  const gymName = gym?.name ?? siteConfig.name;
  const hasContactInfo = Boolean(gym?.phone || gym?.email);

  return (
    <main>
      <Navbar gymName={gymName} />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
          Frequently asked questions
        </h1>

        <div className="mt-8">
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
              <a href="/privacy" className="font-medium text-[var(--color-accent)] hover:underline">
                Privacy Policy
              </a>{" "}
              for details on what we collect and how it&apos;s used.
            </p>
          </FaqItem>
        </div>

        <p className="mt-8 text-sm text-[var(--color-ink-muted)]">
          {hasContactInfo
            ? "Question about hours, pricing, or classes? Contact us using the details below."
            : "Question about hours, pricing, or classes? Ask at the front desk."}
        </p>
      </section>

      <Footer gymName={gymName} />
    </main>
  );
}
