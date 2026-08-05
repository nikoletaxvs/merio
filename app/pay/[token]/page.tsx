import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { Badge, Button, Card, SpotifyMark } from "@/components/ui";
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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <SpotifyMark className="h-10 w-10" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Payment link not found
        </h1>
        <p className="mt-2 text-muted">This payment link is invalid.</p>
      </main>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const payment = member.payments.find(
    (payment) => payment.paymentMonth === currentMonth,
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <SpotifyMark className="h-12 w-12" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          {member.subscription.name}
        </h1>
        <p className="mt-1 text-muted">
          Hi {member.user.name}, here&apos;s this month&apos;s payment.
        </p>
      </div>

      {payment ? (
        <Card className="mt-8 flex flex-col items-center text-center">
          <p className="text-sm text-muted">This month&apos;s payment</p>

          <p className="mt-2 text-4xl font-bold tracking-tight">
            €{(payment.amountCents / 100).toFixed(2)}
          </p>

          {payment.status === "paid" ? (
            <div className="mt-6 w-full rounded-xl bg-brand-soft px-4 py-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Payment marked as paid
              </p>
              {payment.paidAt && (
                <p className="mt-1 text-sm text-muted">
                  Paid on {payment.paidAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <>
              <Badge tone="pending" className="mt-6">
                Pending
              </Badge>

              <form
                action={markPaymentAsPaid.bind(null, payment.id)}
                className="mt-6 w-full"
              >
                <Button type="submit" className="w-full">
                  I&apos;ve paid
                </Button>
              </form>
            </>
          )}
        </Card>
      ) : (
        <Card className="mt-8 text-center">
          <p className="text-muted">
            No payment has been generated for this month yet.
          </p>
        </Card>
      )}
    </main>
  );
}
