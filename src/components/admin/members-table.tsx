import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/dates";
import { MEMBER_STATUS_LABEL, MEMBER_STATUS_TONE } from "@/modules/members/types";
import type { MemberListResult, MemberStatusFilter } from "@/modules/members/types";

interface MembersTableProps {
  result: MemberListResult;
  currentQuery: string;
  currentStatus: MemberStatusFilter;
}

const STATUS_OPTIONS: { value: MemberStatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRING", label: "Expiring soon" },
  { value: "EXPIRED", label: "Expired" },
  { value: "INACTIVE", label: "Inactive" },
];

export function MembersTable({ result, currentQuery, currentStatus }: MembersTableProps) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-4">
      {/* A plain GET form - filtering works via the URL, no client JS required. */}
      <form className="flex flex-wrap gap-3" method="get">
        <Input
          name="query"
          defaultValue={currentQuery}
          placeholder="Search name, phone, or member ID"
          className="max-w-xs"
        />
        <Select name="status" defaultValue={currentStatus} className="max-w-48">
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      {result.members.length === 0 ? (
        <EmptyState
          title="No members match these filters"
          description="Try clearing the search or status filter."
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Member</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
                <TableHeaderCell>Valid till</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {result.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{member.memberCode}</p>
                  </TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{formatDate(member.joinDate)}</TableCell>
                  <TableCell>
                    {member.membershipEnd ? formatDate(member.membershipEnd) : "No membership yet"}
                  </TableCell>
                  <TableCell>
                    <Badge tone={MEMBER_STATUS_TONE[member.status]}>
                      {MEMBER_STATUS_LABEL[member.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-[var(--color-ink-muted)]">
              <span>
                Page {result.page} of {totalPages} - {result.total} members
              </span>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <PageLink query={currentQuery} status={currentStatus} page={result.page - 1}>
                    Previous
                  </PageLink>
                ) : null}
                {result.page < totalPages ? (
                  <PageLink query={currentQuery} status={currentStatus} page={result.page + 1}>
                    Next
                  </PageLink>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function PageLink({
  query,
  status,
  page,
  children,
}: {
  query: string;
  status: MemberStatusFilter;
  page: number;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status !== "ALL") params.set("status", status);
  params.set("page", String(page));

  return (
    <Link
      href={`/admin/members?${params.toString()}`}
      className="font-medium text-[var(--color-accent)] hover:underline"
    >
      {children}
    </Link>
  );
}
