import { requireMemberSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { MemberHeader } from "@/components/member/member-header";
import { MemberNav } from "@/components/member/member-nav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already blocks unauthenticated requests to /member/* - this
  // is the second, independent layer (see modules/auth/guards.ts).
  const session = await requireMemberSession();
  const member = await db.member.findUnique({
    where: { id: session.memberId },
    select: { name: true },
  });

  return (
    <div className="min-h-screen">
      <MemberHeader memberName={member?.name ?? "Member"} />
      <MemberNav />
      <main className="mx-auto max-w-3xl p-6">{children}</main>
    </div>
  );
}
