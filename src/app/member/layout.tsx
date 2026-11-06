import { requireMemberSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { MemberHeader } from "@/components/member/member-header";
import { MemberNav } from "@/components/member/member-nav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already blocks unauthenticated requests to /member/* - this
  // is the second, independent layer (see modules/auth/guards.ts).
  const session = await requireMemberSession();
  const [member, gym] = await Promise.all([
    db.member.findUnique({ where: { id: session.memberId }, select: { name: true } }),
    db.gym.findUnique({ where: { id: session.gymId }, select: { name: true } }),
  ]);

  return (
    <div className="min-h-screen">
      <MemberHeader gymName={gym?.name ?? "GymFlow"} memberName={member?.name ?? "Member"} />
      <MemberNav />
      {/* Extra bottom space on phones so the fixed tab bar never covers content. */}
      <main className="mx-auto w-full max-w-[1400px] p-4 pb-28 sm:p-6 sm:pb-6 lg:p-10">{children}</main>
    </div>
  );
}
