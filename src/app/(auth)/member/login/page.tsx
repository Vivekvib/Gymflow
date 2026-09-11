import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberLoginForm } from "@/components/member/member-login-form";
import { siteConfig } from "@/config/site";

export default function MemberLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">{siteConfig.name} - Member sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberLoginForm />
          <p className="mt-4 text-center text-xs text-[var(--color-ink-muted)]">
            Gym staff?{" "}
            <Link href="/admin/login" className="font-medium text-[var(--color-accent)] hover:underline">
              Go to admin sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
