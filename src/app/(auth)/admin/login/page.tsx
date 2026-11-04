import { AuthShell } from "@/components/marketing/auth-shell";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getPublicGymName } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";

export default async function AdminLoginPage() {
  const gymName = await getPublicGymName(siteConfig.name);

  return (
    <AuthShell
      gymName={gymName}
      title="Staff sign in"
      subtitle="For gym staff and owners."
      alternate={{
        text: "Member instead?",
        label: "Go to member sign in",
        href: "/member/login",
      }}
    >
      <AdminLoginForm />
    </AuthShell>
  );
}
