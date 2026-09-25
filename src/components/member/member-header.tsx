import { memberLogoutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";

interface MemberHeaderProps {
  gymName: string;
  memberName: string;
}

export function MemberHeader({ gymName, memberName }: MemberHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-3">
      <div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">{gymName}</p>
        <p className="text-xs text-[var(--color-ink-muted)]">Welcome, {memberName}</p>
      </div>
      <form action={memberLogoutAction}>
        <Button type="submit" variant="secondary" size="sm">
          Log out
        </Button>
      </form>
    </header>
  );
}
