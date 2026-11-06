import Link from "next/link";
import { requireAdminSession } from "@/modules/auth/guards";
import { listMembers } from "@/modules/members/service";
import { getGym } from "@/modules/gym/service";
import { memberListQuerySchema } from "@/modules/members/validation";
import { MembersTable } from "@/components/admin/members-table";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";

interface AdminMembersPageProps {
  searchParams: Promise<{ query?: string; status?: string; within?: string; page?: string }>;
}

export default async function AdminMembersPage({ searchParams }: AdminMembersPageProps) {
  const rawParams = await searchParams;
  const session = await requireAdminSession();

  const parsed = memberListQuerySchema.safeParse(rawParams);
  const query = parsed.success
    ? parsed.data
    : { query: undefined, status: "ALL" as const, within: undefined, page: 1 };

  const [result, gym] = await Promise.all([listMembers(session.gymId, query), getGym(session.gymId)]);

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
      <MembersTable
        result={result}
        currentQuery={query.query ?? ""}
        currentStatus={query.status}
        currentWithin={query.within}
        gymName={gym?.name ?? "the gym"}
      />
    </div>
  );
}
