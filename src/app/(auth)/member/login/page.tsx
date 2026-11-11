import { AuthShell } from "@/components/marketing/auth-shell";
import { MemberLoginForm } from "@/components/member/member-login-form";
import { getPublicGymName } from "@/modules/gym/service";
import { siteConfig } from "@/config/site";

const NOTICES = {
  suspended: "Your account has been switched off. Please contact the front desk.",
  ended: "Your session has ended. Please sign in again.",
} as const;

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [gymName, { notice }] = await Promise.all([getPublicGymName(siteConfig.name), searchParams]);
  // Own keys only: `?notice=constructor` must not pick up an inherited property.
  const noticeText = notice === "suspended" || notice === "ended" ? NOTICES[notice] : undefined;

  return (
    <AuthShell
      gymName={gymName}
      title="Member sign in"
      subtitle="Sign in with your member ID or mobile number."
      alternate={{
        text: "Gym staff?",
        label: "Go to staff sign in",
        href: "/admin/login",
      }}
    >
      {noticeText ? (
        <p
          role="status"
          className="mb-4 rounded-[var(--radius-control)] bg-[var(--color-warn-bg)] px-3 py-2 text-sm text-[var(--color-warn)]"
        >
          {noticeText}
        </p>
      ) : null}
      <MemberLoginForm />
    </AuthShell>
  );
}
