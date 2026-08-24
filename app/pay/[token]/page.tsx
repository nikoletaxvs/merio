import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { Badge, Button, Card, MerioMark } from "@/components/ui";
import { formatDateLong, formatPeriod, getCurrentPeriod } from "@/lib/periods";
import { markPaymentAsPaid } from "../actions";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: Props) {
  const { token } = await params;

  const member = await db.query.members.findFirst({
    where: eq(members.token, token),
    with: {
      user: true,
      subscription: true,
      payments: true,
    },
  });

  if (!member) {
    return (
      <main className="page-glow flex min-h-screen w-full items-center justify-center bg-black px-6 py-16 text-white">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
            <MerioMark className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Payment link not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/45">
            This payment link is invalid or may have expired.
          </p>
        </div>
      </main>
    );
  }

  const { start: periodStart } = getCurrentPeriod(
    member.subscription.startDate,
  );

  const payment = member.payments.find(
    (payment) => payment.periodStart === periodStart,
  );

  const pastPayments = member.payments
    .filter((past) => past.periodStart !== periodStart)
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart));

  const isPaid = payment?.status === "paid";

  return (
    <main className="page-glow min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10 sm:px-6">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          {member.subscription.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.subscription.photoUrl}
              alt=""
              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
              <MerioMark className="h-8 w-8 text-black" />
            </div>
          )}

          <p className="mt-5 text-sm font-medium text-white/50">
            {member.subscription.familyName ?? member.subscription.name}
          </p>

          <h1 className="mt-1.5 text-3xl font-bold tracking-tight">
            Hi, {member.user.name}
          </h1>

          <p className="mt-2 text-sm text-white/45">
            {payment
              ? `Your payment for ${formatPeriod(payment.periodStart, payment.periodEnd)}`
              : "Your payment for this period"}
          </p>
        </header>

        {payment ? (
          <Card className="mt-8 overflow-hidden border-white/10 bg-white/[0.04] p-0 shadow-none">
            <div
              aria-hidden="true"
              className={`h-px w-full bg-gradient-to-r from-transparent to-transparent ${
                isPaid ? "via-emerald-400/60" : "via-brand/60"
              }`}
            />

            {/* Amount */}
            <div
              className={`px-6 pb-7 pt-9 text-center ${
                isPaid
                  ? "bg-emerald-400/[0.05]"
                  : "bg-[radial-gradient(420px_circle_at_50%_-40%,rgba(109,91,208,0.22),transparent_70%)]"
              }`}
            >
              <p
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  isPaid
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/[0.05] text-white/40"
                }`}
              >
                {isPaid ? (
                  <>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M4 10.5 8 14.5 16 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Paid — thank you
                  </>
                ) : (
                  "Amount due"
                )}
              </p>

              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-white/60">€</span>

                <span className="text-6xl font-bold leading-none tracking-[-0.04em] tabular-nums">
                  {Math.floor(payment.amountCents / 100)}
                </span>

                <span className="text-2xl font-bold text-white/45 tabular-nums">
                  .{String(payment.amountCents % 100).padStart(2, "0")}
                </span>
              </div>

              {!isPaid && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-warning/90">
                  Awaiting your transfer
                </p>
              )}
            </div>

            <div className="border-t border-white/[0.08]" />

            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-white/45">Period</span>
              <span className="text-sm font-medium">
                {formatPeriod(payment.periodStart, payment.periodEnd)}
              </span>
            </div>

            <div className="border-t border-white/[0.08]" />

            {isPaid ? (
              <div className="p-5">
                <div className="rounded-xl bg-emerald-400/[0.08] p-4 ring-1 ring-emerald-400/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-emerald-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-emerald-300">
                        Payment complete
                      </p>

                      {payment.paidAt && (
                        <p className="mt-1 text-sm text-white/40">
                          Paid on {formatDateLong(payment.paidAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/45">Status</span>

                  <Badge tone="pending">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                    Pending
                  </Badge>
                </div>

                <form
                  action={markPaymentAsPaid.bind(null, payment.id)}
                  className="mt-5"
                >
                  <Button type="submit" className="w-full shadow-lg shadow-brand/25">
                    I&apos;ve paid €{(payment.amountCents / 100).toFixed(2)}
                  </Button>
                </form>

                <p className="mt-3 text-center text-xs leading-5 text-white/30">
                  Only mark this as paid after you&apos;ve completed the
                  payment.
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card className="mt-8 border-white/10 bg-white/[0.04] text-center shadow-none">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white/40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <h2 className="mt-4 font-semibold">Not ready yet</h2>

            <p className="mt-1 text-sm leading-6 text-white/40">
              Your payment for this period hasn&apos;t been generated yet. Check
              back later.
            </p>
          </Card>
        )}

        {/* Past payments */}
        {pastPayments.length > 0 && (
          <Card className="mt-4 border-white/10 bg-white/[0.04] p-5 shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                Past payments
              </p>

              <span className="text-xs font-medium text-white/30">
                {pastPayments.filter((p) => p.status === "paid").length}/
                {pastPayments.length} paid
              </span>
            </div>

            <ul className="mt-1 divide-y divide-white/[0.06]">
              {pastPayments.map((past) => {
                const pastPaid = past.status === "paid";

                return (
                  <li
                    key={past.id}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          pastPaid ? "bg-brand" : "bg-warning"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/80">
                          {formatPeriod(past.periodStart, past.periodEnd)}
                        </p>

                        {past.paidAt && (
                          <p className="mt-0.5 text-xs text-white/30">
                            Paid {formatDateLong(past.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-medium tabular-nums text-white/80">
                        €{(past.amountCents / 100).toFixed(2)}
                      </p>

                      <Badge tone={pastPaid ? "success" : "pending"}>
                        {pastPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-auto flex flex-col items-center gap-2 pt-10 text-center">
          <MerioMark className="h-4 w-4 text-white/20" />
          <p className="text-xs text-white/25">
            Payments for{" "}
            {member.subscription.familyName ?? member.subscription.name}
          </p>
        </footer>
      </div>
    </main>
  );
}
