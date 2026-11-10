import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/dates";
import { formatPhoneDisplay, toTelHref, toWhatsAppUrl } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { getMembershipDisplay } from "@/modules/membership/state";
import type { MemberListItem, MemberListResult, MemberStatusFilter } from "@/modules/members/types";

interface MembersTableProps {
  result: MemberListResult;
  currentQuery: string;
  currentStatus: MemberStatusFilter;
  /** Set when the list was opened from a dashboard "Next 7 days" style link. */
  currentWithin?: number;
  gymName: string;
}

// Wording comes from the membership module, so a filter reads exactly like the badges it finds.
const STATUS_OPTIONS: { value: MemberStatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  ...(["ACTIVE", "EXPIRING", "EXPIRED", "INACTIVE"] as const).map((value) => ({
    value,
    label: getMembershipDisplay(value).label,
  })),
];

function whatsAppHref(member: MemberListItem, gymName: string): string {
  const firstName = member.name.trim().split(/\s+/)[0] ?? member.name;
  return toWhatsAppUrl(member.phone, `Hi ${firstName}, this is ${gymName}.`);
}

function MemberStatusBadge({ member, className }: { member: MemberListItem; className?: string }) {
  const display = getMembershipDisplay(member.status);
  return (
    <Badge tone={display.tone} className={className}>
      {display.label}
    </Badge>
  );
}

/** Call, WhatsApp, and (when a membership needs it) Renew - the three things done from this list. */
function MemberActions({ member, gymName }: { member: MemberListItem; gymName: string }) {
  const needsPayment = member.nextAction === "RENEW" || member.nextAction === "ADD_PAYMENT";
  const iconButton = cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-10 w-10 px-0 xl:h-8 xl:w-8");

  return (
    <div className="flex items-center gap-2">
      <a href={toTelHref(member.phone)} aria-label={`Call ${member.name}`} className={iconButton}>
        <Phone className="h-4 w-4" aria-hidden />
      </a>
      <a
        href={whatsAppHref(member, gymName)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${member.name}`}
        className={iconButton}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
      </a>
      {needsPayment ? (
        <Link
          href={`/admin/payments/new?memberId=${member.id}`}
          className={cn(buttonVariants({ size: "sm" }), "h-10 px-4 xl:h-8")}
        >
          {member.nextAction === "ADD_PAYMENT" ? "Add payment" : "Renew"}
        </Link>
      ) : null}
    </div>
  );
}

export function MembersTable({
  result,
  currentQuery,
  currentStatus,
  currentWithin,
  gymName,
}: MembersTableProps) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-4">
      {/* A plain GET form - filtering works via the URL, no client JS required. */}
      <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" method="get">
        <Input
          name="query"
          type="search"
          defaultValue={currentQuery}
          placeholder="Search name, mobile number, or member ID"
          aria-label="Search members"
          className="sm:max-w-xs"
        />
        <Select name="status" defaultValue={currentStatus} aria-label="Filter by status" className="sm:max-w-48">
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {currentStatus === "EXPIRING" && currentWithin ? (
          <input type="hidden" name="within" value={currentWithin} />
        ) : null}
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {currentStatus === "EXPIRING" && currentWithin ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Showing memberships ending in the next {currentWithin} days.{" "}
          <Link
            href="/admin/members?status=EXPIRING&within=30"
            className="font-medium text-[var(--color-accent)] hover:underline"
          >
            Show the next 30 days
          </Link>
        </p>
      ) : null}

      {result.members.length === 0 ? (
        <EmptyState
          title="No members match these filters"
          description="Try clearing the search or status filter."
        />
      ) : (
        <>
          {/*
            Cards below 1280px, the table above it. The admin sidebar takes
            224px from tablets up, so the six-column table only has room on
            a laptop-sized screen; tablets get a two-column grid of cards.
          */}
          <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
            {result.members.map((member) => (
              <li
                key={member.id}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="block truncate font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                    >
                      {member.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{member.memberCode}</p>
                    <p className="whitespace-nowrap text-xs text-[var(--color-ink-muted)]">
                      {formatPhoneDisplay(member.phone)}
                    </p>
                  </div>
                  <MemberStatusBadge member={member} className="shrink-0" />
                </div>
                <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                  {member.membershipEnd
                    ? `Valid till ${formatDate(member.membershipEnd)}`
                    : "No membership yet"}
                </p>
                <div className="mt-3">
                  <MemberActions member={member} gymName={gymName} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden xl:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Member</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                  <TableHeaderCell>Joined</TableHeaderCell>
                  <TableHeaderCell>Valid till</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>
                    <span className="sr-only">Actions</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="font-medium hover:text-[var(--color-accent)]"
                      >
                        {member.name}
                      </Link>
                      <p className="text-xs text-[var(--color-ink-muted)]">{member.memberCode}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatPhoneDisplay(member.phone)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(member.joinDate)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {member.membershipEnd ? formatDate(member.membershipEnd) : "No membership yet"}
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge member={member} />
                    </TableCell>
                    <TableCell>
                      <MemberActions member={member} gymName={gymName} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-ink-muted)]">
              <span>
                Page {result.page} of {totalPages}, {result.total} members
              </span>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <PageLink
                    query={currentQuery}
                    status={currentStatus}
                    within={currentWithin}
                    page={result.page - 1}
                  >
                    Previous
                  </PageLink>
                ) : null}
                {result.page < totalPages ? (
                  <PageLink
                    query={currentQuery}
                    status={currentStatus}
                    within={currentWithin}
                    page={result.page + 1}
                  >
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
  within,
  page,
  children,
}: {
  query: string;
  status: MemberStatusFilter;
  within?: number;
  page: number;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status !== "ALL") params.set("status", status);
  if (status === "EXPIRING" && within) params.set("within", String(within));
  params.set("page", String(page));

  return (
    <Link
      href={`/admin/members?${params.toString()}`}
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-10 px-4 xl:h-8")}
    >
      {children}
    </Link>
  );
}
