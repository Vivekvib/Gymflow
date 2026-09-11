import { requireAdminSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { PaymentForm } from "@/components/admin/payment-form";
import { PageHeader } from "@/components/shared/page-header";

interface NewPaymentPageProps {
  searchParams: Promise<{ memberId?: string }>;
}

export default async function NewPaymentPage({ searchParams }: NewPaymentPageProps) {
  const { memberId } = await searchParams;
  const session = await requireAdminSession();

  if (memberId) {
    const member = await db.member.findFirst({
      where: { id: memberId, gymId: session.gymId },
      select: { id: true, name: true, memberCode: true },
    });

    return (
      <div>
        <PageHeader title="Record payment" />
        <PaymentForm preselectedMember={member ?? undefined} />
      </div>
    );
  }

  const members = await db.member.findMany({
    where: { gymId: session.gymId, active: true },
    select: { id: true, name: true, memberCode: true },
    orderBy: { name: "asc" },
    take: 500,
  });

  return (
    <div>
      <PageHeader title="Record payment" />
      <PaymentForm memberOptions={members} />
    </div>
  );
}
