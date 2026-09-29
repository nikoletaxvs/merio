import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Amount, Badge, Icon, MerioMark } from "@/components/ui";
import { formatPeriod, getCurrentPeriod } from "@/lib/billing/periods";
import CurrentPayment from "./CurrentPayment";

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
    notFound();
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

  const familyName = member.subscription.familyName ?? member.subscription.name;

  return (
    <main className="min-h-dvh w-full">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10 sm:px-6">
        <header className="flex items-center gap-3">
          {member.subscription.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.subscription.photoUrl}
              alt=""
              className="h-10 w-10 rounded-md border border-border object-cover"
            />
          ) : (
            <MerioMark className="h-10 w-10" />
          )}

          <p className="text-sm text-muted">{familyName}</p>
        </header>

        <h1 className="mt-8 font-display text-4xl font-medium">
          Hi, {member.user.name.split(" ")[0]}.
        </h1>

        {payment ? (
          <CurrentPayment
            token={token}
            payment={{
              amountCents: payment.amountCents,
              periodStart: payment.periodStart,
              periodEnd: payment.periodEnd,
              status: payment.status,
              paidAt: payment.paidAt,
            }}
          />
        ) : (
          <>
            <p className="mt-2 text-muted">Nothing to pay yet.</p>

            <section className="mt-8 rounded-md border border-dashed border-border-strong p-5">
              <div className="flex items-start gap-3">
                <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <p className="text-sm leading-6 text-muted">
                  This month&apos;s payment hasn&apos;t been created yet.
                  You&apos;ll get an email when it is.
                </p>
              </div>
            </section>
          </>
        )}

        {pastPayments.length > 0 && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="font-display text-lg font-medium">Earlier months</h2>
              <span className="text-xs tabular-nums text-muted">
                {pastPayments.filter((p) => p.status === "paid").length}/
                {pastPayments.length} paid
              </span>
            </div>

            <ul className="divide-y divide-border">
              {pastPayments.map((past) => {
                const pastPaid = past.status === "paid";

                return (
                  <li
                    key={past.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="tabular-nums text-muted">
                      {formatPeriod(past.periodStart, past.periodEnd)}
                    </span>

                    <span className="flex items-center gap-3">
                      <Amount cents={past.amountCents} />
                      <Badge tone={pastPaid ? "success" : "pending"}>
                        {pastPaid ? "Paid" : "Owed"}
                      </Badge>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <footer className="mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 pt-12 text-xs text-muted">
          <p>Sent to you by {familyName} via Merio.</p>
          <Link
            href="/privacy"
            className="underline decoration-border-strong underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            How your data is used
          </Link>
        </footer>
      </div>
    </main>
  );
}
