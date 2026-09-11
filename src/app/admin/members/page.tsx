import Link from "next/link";
import { requireAdminSession } from "@/modules/auth/guards";
import { listMembers } from "@/modules/members/service";
import { memberListQuerySchema } from "@/modules/members/validation";
import { MembersTable } from "@/components/admin/members-table";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

interface AdminMembersPageProps {
  searchParams: Promise<{ query?: string; status?: string; page?: string }>;
}

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps) {
  const rawParams = await searchParams;
  const session = await requireAdminSession();

  const parsed = memberListQuerySchema.safeParse(rawParams);
  const query = parsed.success ? parsed.data : { query: undefined, status: "ALL" as const, page: 1 };

  const result = await listMembers(session.gymId, query);

  return (
    <div>
      <PageHeader
        title="Members"
        description={`${result.total} member${result.total === 1 ? "" : "s"}`}
        actions={
          <Link href="/admin/members/new" className={buttonVariants({ size: "sm" })}>
            Add member
          </Link>
        }
      />
      <MembersTable result={result} currentQuery={query.query ?? ""} currentStatus={query.status} />
    </div>
  );
}
