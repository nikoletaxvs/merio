import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { Badge, Button, Card, MerioMark } from "@/components/ui";
import { formatPeriod, getCurrentPeriod } from "@/lib/periods";
import { markPaymentAsPaid } from "../actions";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

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
      <main className="flex min-h-screen w-full items-center justify-center bg-black px-6 py-16 text-white">
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

  const isPaid = payment?.status === "paid";

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10 sm:px-6">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          {member.subscription.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.subscription.photoUrl}
              alt=""
              className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand">
              <MerioMark className="h-7 w-7 text-black" />
            </div>
          )}

          <p className="mt-6 text-sm font-medium text-white/40">
            {member.subscription.familyName ?? member.subscription.name}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
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
            {/* Amount */}
            <div className="px-6 pb-7 pt-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">
                Amount due
              </p>

              <p className="mt-3 text-5xl font-bold tracking-[-0.04em]">
                €{(payment.amountCents / 100).toFixed(2)}
              </p>
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
                <div className="rounded-xl bg-brand/10 p-4 ring-1 ring-brand/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-brand"
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
                      <p className="font-semibold text-brand">
                        Payment complete
                      </p>

                      {payment.paidAt && (
                        <p className="mt-1 text-sm text-white/40">
                          Paid on{" "}
                          {payment.paidAt.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
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

                  <Badge tone="pending">Pending</Badge>
                </div>

                <form
                  action={markPaymentAsPaid.bind(null, payment.id)}
                  className="mt-5"
                >
                  <Button type="submit" className="w-full">
                    I&apos;ve paid
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

        {/* Footer */}
        <footer className="mt-auto pt-10 text-center">
          <p className="text-xs text-white/25">
            Payments for{" "}
            {member.subscription.familyName ?? member.subscription.name}
          </p>
        </footer>
      </div>
    </main>
  );
}
