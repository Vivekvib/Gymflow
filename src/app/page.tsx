import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { PublicPage } from "@/components/marketing/public-page";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { About } from "@/components/marketing/about";
import { Services } from "@/components/marketing/services";
import { JoinSteps } from "@/components/marketing/join-steps";
import { MembershipPlans } from "@/components/marketing/membership-plans";
import { ContactSection } from "@/components/marketing/contact-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { Footer } from "@/components/marketing/footer";

export default async function HomePage() {
  const gym = await getPublicGym();
  // Falls back to the env-var branding (config/site.ts) if the Gym row is
  // ever missing - shouldn't happen after seeding, but the public page
  // should never hard-crash over it.
  const gymName = gym?.name ?? siteConfig.name;

  return (
    <PublicPage>
      <Navbar gymName={gymName} overlay />
      <main>
        <Hero gymName={gymName} city={gym?.city} />
        <About />
        <Services />
        <JoinSteps />
        <MembershipPlans />
        <ContactSection gym={gym} />
        <CtaBanner />
      </main>
      <Footer gymName={gymName} gym={gym} />
    </PublicPage>
  );
}
