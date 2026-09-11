import { adminLogoutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  adminName: string;
}

export function AdminHeader({ adminName }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-3">
      <p className="text-sm text-[var(--color-ink-muted)]">
        Signed in as <span className="font-medium text-[var(--color-ink)]">{adminName}</span>
      </p>
      <form action={adminLogoutAction}>
        <Button type="submit" variant="secondary" size="sm">
          Log out
        </Button>
      </form>
    </header>
  );
}
