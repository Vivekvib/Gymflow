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

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments recorded yet"
        description="Record the member's first payment to activate their membership."
      />
    );
  }

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
