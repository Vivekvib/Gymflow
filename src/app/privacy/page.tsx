import type { Metadata } from "next";
import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { PublicPage } from "@/components/marketing/public-page";
import { Container } from "@/components/marketing/container";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = { title: "Privacy Policy" };

/*
 * NOTE FOR THE GYM OWNER: this page describes accurately what the membership
 * system collects and does, but it is a starting draft, not legal advice.
 * Data protection law (e.g. India's Digital Personal Data Protection Act, or
 * GDPR if any member is in the EU) may impose extra requirements. Have it
 * reviewed by a qualified professional before relying on it.
 */

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--color-line)] pt-6">
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--color-ink)]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm text-[var(--color-ink-muted)]">{children}</div>
    </div>
  );
}

export default async function PrivacyPage() {
  const gym = await getPublicGym();
  const gymName = gym?.name ?? siteConfig.name;
  const contactLine = [gym?.email, gym?.phone].filter(Boolean).join(" or ");

  return (
    <PublicPage>
      <Navbar gymName={gymName} />

      <main>
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
              <span aria-hidden>+ </span>
              Privacy
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Privacy policy
            </h1>
            <p className="mt-5 max-w-sm rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-ink-muted)]">
              This page describes, plainly and accurately, what {gymName}&apos;s membership system
              actually collects and does with member data. It is a starting draft, not legal
              advice. Data protection law (for example India&apos;s Digital Personal Data
              Protection Act, or GDPR if any member is in the EU) may impose additional
              requirements, so have it reviewed by a qualified professional before relying on it.
            </p>
          </div>

          <div className="space-y-8 lg:col-span-8">
            <PolicySection title="What information we collect">
              <p>When you become a member, we collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Your name, phone number, and email address (email is optional)</li>
                <li>Date of birth, gender, and height, if you choose to provide them</li>
                <li>An emergency contact name and phone number, if you choose to provide one</li>
                <li>Your membership and payment records (amount, method, and dates)</li>
              </ul>
              <p>If you use the fitness-tracking features, we also store:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Weight and body-measurement entries you log</li>
                <li>Any fitness goal you set</li>
                <li>Your assigned workout plan</li>
              </ul>
            </PolicySection>

            <PolicySection title="How your information is used">
              <p>
                Solely to run your membership: tracking who is an active member, recording
                payments, calculating your membership expiry, and providing the progress and
                workout features you choose to use. It is not sold, and it is not used for
                advertising.
              </p>
            </PolicySection>

            <PolicySection title="Who can see it">
              <p>
                Gym staff with an admin account can see member and payment records to manage
                memberships. Your fitness data (weight, goals, workout plan) is visible to you
                and to staff building or reviewing your plan. Other members can never see your
                data.
              </p>
            </PolicySection>

            <PolicySection title="Passwords">
              <p>
                Your password is stored as a one-way cryptographic hash (Argon2id), not as
                readable text. Staff cannot look up or recover your password; they can only
                reset it to a new one you choose.
              </p>
            </PolicySection>

            <PolicySection title="Payments">
              <p>
                Cash, UPI, card, and bank-transfer payments are recorded directly by staff and
                are not shared with any third-party payment processor. If online card or UPI
                payments are introduced later, this policy will be updated to name the payment
                processor involved and what it receives.
              </p>
            </PolicySection>

            <PolicySection title="Cookies">
              <p>
                The site uses a single session cookie to keep you signed in. It contains no
                tracking or advertising identifiers and is not shared with any third party.
              </p>
            </PolicySection>

            <PolicySection title="Accessing or deleting your data">
              <p>
                You can view and update most of your own information from your Profile page at
                any time. To request a full copy or deletion of your data, contact the gym
                directly{contactLine ? ` at ${contactLine}` : ""}.
              </p>
            </PolicySection>
          </div>
        </Container>
      </main>

      <Footer gymName={gymName} gym={gym} />
    </PublicPage>
  );
}
