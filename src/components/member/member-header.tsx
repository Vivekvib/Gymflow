import { memberLogoutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";

interface MemberHeaderProps {
  gymName: string;
  memberName: string;
}

export function MemberHeader({ gymName, memberName }: MemberHeaderProps) {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{gymName}</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Welcome, {memberName}</p>
        </div>
        <form action={memberLogoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
