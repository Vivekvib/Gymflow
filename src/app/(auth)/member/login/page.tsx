import { AuthShell } from "@/components/marketing/auth-shell";
import { MemberLoginForm } from "@/components/member/member-login-form";
import { getPublicGymName } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";

export default async function MemberLoginPage() {
  const gymName = await getPublicGymName(siteConfig.name);

  return (
    <AuthShell
      gymName={gymName}
      title="Member sign in"
      subtitle="Use your member ID or phone number."
      alternate={{
        text: "Gym staff?",
        label: "Go to staff sign in",
        href: "/admin/login",
      }}
    >
      <MemberLoginForm />
    </AuthShell>
  );
}
