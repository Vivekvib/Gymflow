import type { Metadata } from "next";
import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const gym = await getPublicGym();
  const gymName = gym?.name ?? siteConfig.name;
  const contactLine = [gym?.email, gym?.phone].filter(Boolean).join(" or ");

  return (
    <main>
      <Navbar gymName={gymName} />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
          Privacy Policy
        </h1>

        <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-sm text-[var(--color-ink-muted)]">
          This page describes, plainly and accurately, what {gymName}&apos;s membership system
          actually collects and does with member data - it is a starting draft, not legal advice.
          Data protection law (e.g. India&apos;s Digital Personal Data Protection Act, or GDPR if
          any member is in the EU) may impose additional requirements. Have this reviewed by a
          qualified professional before relying on it.
        </div>

        <div className="mt-8 space-y-8 text-sm text-[var(--color-ink-muted)]">
          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">
              What information we collect
            </h2>
            <p className="mt-2">When you become a member, we collect:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Your name, phone number, and email address (email is optional)</li>
              <li>Date of birth, gender, and height, if you choose to provide them</li>
              <li>An emergency contact name and phone number, if you choose to provide one</li>
              <li>Your membership and payment records (amount, method, and dates)</li>
            </ul>
            <p className="mt-2">If you use the fitness-tracking features, we also store:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Weight and body-measurement entries you log</li>
              <li>Any fitness goal you set</li>
              <li>Your assigned workout plan</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">
              How your information is used
            </h2>
            <p className="mt-2">
              Solely to run your membership: tracking who is an active member, recording
              payments, calculating your membership expiry, and providing the progress and
              workout features you choose to use. It is not sold, and it is not used for
              advertising.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">Who can see it</h2>
            <p className="mt-2">
              Gym staff with an admin account can see member and payment records to manage
              memberships. Your fitness data (weight, goals, workout plan) is visible to you and
              to staff building or reviewing your plan. Other members can never see your data.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">Passwords</h2>
            <p className="mt-2">
              Your password is stored as a one-way cryptographic hash (Argon2id) - not as
              readable text. Staff cannot look up or recover your password; they can only reset
              it to a new one you choose.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">Payments</h2>
            <p className="mt-2">
              Cash, UPI, card, and bank-transfer payments are recorded directly by staff and are
              not shared with any third-party payment processor. If online card/UPI payments are
              introduced later, this policy will be updated to name the payment processor
              involved and what it receives.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">Cookies</h2>
            <p className="mt-2">
              The site uses a single session cookie to keep you signed in. It contains no
              tracking or advertising identifiers and is not shared with any third party.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[var(--color-ink)]">
              Accessing or deleting your data
            </h2>
            <p className="mt-2">
              You can view and update most of your own information from your Profile page at any
              time. To request a full copy or deletion of your data, contact the gym directly
              {contactLine ? ` at ${contactLine}` : ""}.
            </p>
          </div>
        </div>
      </section>

      <Footer gymName={gymName} />
    </main>
  );
}
