"use client";

import { useOptimistic, useState } from "react";
import { Amount, Badge, Button, FormError } from "@/components/ui";
import { formatDateLong, formatPeriod } from "@/lib/billing/periods";
import { markPaymentAsPaid } from "../actions";

type Payment = {
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt: Date | null;
};

export default function CurrentPayment({
  token,
  payment,
}: {
  token: string;
  payment: Payment;
}) {
  // `shown` is what we render. Normally it equals the server's `payment`.
  // While the action is running, markPaid() overrides it with "paid" so the
  // page updates instantly. When the action finishes, React drops the
  // override and goes back to the server's data: now paid if it worked
  // (revalidatePath sends the fresh page back with the response), still
  // pending if it failed. That fallback is the automatic rollback.
  const [shown, markPaid] = useOptimistic(payment, (current) => ({
    ...current,
    status: "paid",
    paidAt: new Date(),
  }));
  const [error, setError] = useState<string | null>(null);

  // A function passed to <form action> runs inside a transition, which is
  // what useOptimistic needs.
  async function submit() {
    setError(null);
    markPaid(null);

    try {
      const result = await markPaymentAsPaid(token);

      if (result.error) {
        setError(result.error);
      }
    } catch {
      // The request itself failed (e.g. offline), so the action never ran.
      setError("You seem to be offline. Nothing was saved; try again.");
    }
  }

  const isPaid = shown.status === "paid";

  return (
    <>
      <p className="mt-2 text-muted" aria-live="polite">
        {isPaid
          ? "You're all settled for this month."
          : "Here's your share for this month."}
      </p>

      <section className="mt-8 rounded-md border border-border bg-surface">
        <div className="flex items-start justify-between gap-4 px-5 pb-6 pt-5">
          <div>
            <p className="text-xs text-muted">Your share</p>
            <Amount
              cents={shown.amountCents}
              className="mt-1 block text-4xl font-medium"
            />
          </div>

          {isPaid && (
            <span className="mt-1 -rotate-6 rounded-sm border-2 border-accent px-2 py-0.5 font-mono text-sm font-medium uppercase tracking-widest text-accent">
              Paid
            </span>
          )}
        </div>

        <dl className="divide-y divide-border border-t border-border text-sm">
          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted">Period</dt>
            <dd className="tabular-nums">
              {formatPeriod(shown.periodStart, shown.periodEnd)}
            </dd>
          </div>

          <div className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-muted">Status</dt>
            <dd>
              {isPaid && shown.paidAt ? (
                <span className="tabular-nums">
                  Paid {formatDateLong(shown.paidAt)}
                </span>
              ) : (
                <Badge tone="pending">Waiting for you</Badge>
              )}
            </dd>
          </div>
        </dl>

        {!isPaid && (
          <div className="border-t border-border p-5">
            {error && (
              <div className="mb-4">
                <FormError>{error}</FormError>
              </div>
            )}

            <form action={submit}>
              <Button type="submit" className="w-full">
                I&apos;ve sent <Amount cents={shown.amountCents} />
              </Button>
            </form>

            <p className="mt-3 text-xs leading-5 text-muted">
              Press this after you&apos;ve made the transfer. It lets the
              organiser know you&apos;ve paid; it doesn&apos;t move any money.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
