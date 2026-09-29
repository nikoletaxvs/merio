import { Amount, Badge } from "@/components/ui";
import { formatDateLong, formatPeriod } from "@/lib/billing/periods";
import type { MemberPayment } from "./types";

/** Every period for one member, newest first. */
export default function PaymentHistory({
  memberName,
  payments,
}: {
  memberName: string;
  payments: MemberPayment[];
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Payment history for {memberName}</caption>
      <tbody className="divide-y divide-border">
        {payments.map((payment) => {
          const paid = payment.status === "paid";

          return (
            <tr key={payment.id}>
              <td className="py-2 pr-3 tabular-nums text-muted">
                {formatPeriod(payment.periodStart, payment.periodEnd)}
              </td>
              <td className="hidden py-2 pr-3 text-muted sm:table-cell">
                {payment.paidAt ? `Paid ${formatDateLong(payment.paidAt)}` : ""}
              </td>
              <td className="py-2 pr-3 text-right">
                <Amount cents={payment.amountCents} />
              </td>
              <td className="w-0 py-2 text-right">
                <Badge tone={paid ? "success" : "pending"} className="w-14">
                  {paid ? "Paid" : "Owed"}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
