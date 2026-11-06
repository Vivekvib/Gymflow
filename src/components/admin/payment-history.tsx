import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/dates";
import { formatPaise } from "@/lib/currency";
import type { Payment } from "@/generated/prisma/client";

const METHOD_LABEL: Record<Payment["method"], string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  RAZORPAY: "Razorpay",
  STRIPE: "Stripe",
};

export function PaymentHistory({
  payments,
  emptyDescription = "Record the member's first payment to activate their membership.",
}: {
  payments: Payment[];
  /** Shown when there are no payments; the member's own view words this differently. */
  emptyDescription?: string;
}) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments recorded yet"
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      {/* Phones: one entry per payment. A five-column table wraps every date onto three lines at this width. */}
      <ul className="divide-y divide-[var(--color-line)] rounded-lg border border-[var(--color-line)] md:hidden">
        {payments.map((payment) => (
          <li key={payment.id} className="p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-[var(--color-ink)]">{formatPaise(payment.amountPaise)}</p>
              <p className="text-sm text-[var(--color-ink-muted)]">{formatDate(payment.paymentDate)}</p>
            </div>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {payment.planDurationDays} days, paid by {METHOD_LABEL[payment.method]}. Valid till{" "}
              {formatDate(payment.membershipEndAfter)}.
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <PaymentTable payments={payments} />
      </div>
    </>
  );
}

function PaymentTable({ payments }: { payments: Payment[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Method</TableHeaderCell>
          <TableHeaderCell>Plan</TableHeaderCell>
          <TableHeaderCell>New expiry</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.paymentDate)}</TableCell>
            <TableCell>{formatPaise(payment.amountPaise)}</TableCell>
            <TableCell>{METHOD_LABEL[payment.method]}</TableCell>
            <TableCell>{payment.planDurationDays} days</TableCell>
            <TableCell>{formatDate(payment.membershipEndAfter)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
