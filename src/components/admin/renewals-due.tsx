import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DASHBOARD_EXPIRY_WINDOWS, EXPIRING_SOON_DAYS, RENEWAL_LAPSED_LOOKBACK_DAYS } from "@/config/constants";
import { formatDate } from "@/lib/dates";
import { toWhatsAppUrl } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { RenewalDue } from "@/modules/dashboard/service";

interface RenewalsDueProps {
  items: RenewalDue[];
  total: number;
  gymName: string;
  expiringCounts: Record<(typeof DASHBOARD_EXPIRY_WINDOWS)[number], number>;
}

function statusFor(daysLeft: number): { label: string; tone: "warning" | "danger" } {
  if (daysLeft < 0) {
    const ago = Math.abs(daysLeft);
    return { label: `Lapsed ${ago} ${ago === 1 ? "day" : "days"} ago`, tone: "danger" };
  }
  if (daysLeft === 0) return { label: "Ends today", tone: "warning" };
  return { label: `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`, tone: "warning" };
}

function reminderText(item: RenewalDue, gymName: string): string {
  const firstName = item.name.trim().split(/\s+/)[0] ?? item.name;
  const date = formatDate(item.membershipEnd);
  return item.daysLeft >= 0
    ? `Hi ${firstName}, your ${gymName} membership ends on ${date}. Visit the front desk to renew and keep your plan going.`
    : `Hi ${firstName}, your ${gymName} membership ended on ${date}. Visit the front desk to renew and pick up where you left off.`;
}

/**
 * The owner's to-do list: who needs a renewal conversation today. Each row
 * has the two things the owner does next - send a WhatsApp reminder, or
 * record the payment - one tap away.
 */
export function RenewalsDue({ items, total, gymName, expiringCounts }: RenewalsDueProps) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <CardTitle className="text-base">Renewals due</CardTitle>
        <nav aria-label="Members whose membership is ending" className="flex flex-wrap gap-1.5 text-xs">
          {DASHBOARD_EXPIRY_WINDOWS.map((days) => (
            <Link
              key={days}
              href={`/admin/members?status=EXPIRING&within=${days}`}
              className="inline-flex min-h-8 items-center rounded-full border border-[var(--color-line-strong)] px-3 text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
            >
              Next {days} days: <span className="ml-1 font-semibold text-[var(--color-ink)]">{expiringCounts[days]}</span>
            </Link>
          ))}
        </nav>
      </CardHeader>

      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No renewals due"
            description={`Nobody's membership ends in the next ${EXPIRING_SOON_DAYS} days, and none lapsed in the last ${RENEWAL_LAPSED_LOOKBACK_DAYS}.`}
          />
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {items.map((item) => {
            const status = statusFor(item.daysLeft);
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/admin/members/${item.id}`}
                    className="block truncate text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                    <span>{item.memberCode}</span>
                    <span>{item.daysLeft < 0 ? "Ended" : "Ends"} {formatDate(item.membershipEnd)}</span>
                  </p>
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Badge tone={status.tone} className="mr-auto sm:mr-2">
                    {status.label}
                  </Badge>
                  <a
                    href={toWhatsAppUrl(item.phone, reminderText(item, gymName))}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Send ${item.name} a WhatsApp reminder`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "h-10 px-3")}
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Remind
                  </a>
                  <Link
                    href={`/admin/payments/new?memberId=${item.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "h-10 px-4")}
                  >
                    Renew
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {total > items.length ? (
        <div className="border-t border-[var(--color-line)] p-3 text-center">
          <Link
            href="/admin/members?status=EXPIRING"
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            {total - items.length} more ending soon or recently lapsed
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
