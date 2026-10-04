import { getPublicGym } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Facilities } from "@/components/marketing/facilities";
import { MembershipPlans } from "@/components/marketing/membership-plans";
import { WhyUs } from "@/components/marketing/why-us";
import { ContactSection } from "@/components/marketing/contact-section";
import { Footer } from "@/components/marketing/footer";

export default async function HomePage() {
  const gym = await getPublicGym();
  // Falls back to the env-var branding (config/site.ts) if the Gym row is
  // ever missing - shouldn't happen after seeding, but the public page
  // should never hard-crash over it.
  const gymName = gym?.name ?? siteConfig.name;

  return (
    <main>
      <Navbar gymName={gymName} />
      <Hero gymName={gymName} city={gym?.city} />
      <Facilities />
      <MembershipPlans />
      <WhyUs />
      <ContactSection gym={gym} />
      <Footer gymName={gymName} />
    </main>
  );
}
