import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { siteConfig } from "@/config/site";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-base">{siteConfig.name} - Admin sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
          <p className="mt-4 text-center text-xs text-[var(--color-ink-muted)]">
            Member instead?{" "}
            <Link href="/member/login" className="font-medium text-[var(--color-accent)] hover:underline">
              Go to member sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
