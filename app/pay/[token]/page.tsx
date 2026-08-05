import { eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
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
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-bold">Payment link not found </h1>
        <p className="mt-2 text-gray-600">This payment link is invalid.</p>
      </main>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const payment = member.payments.find(
    (payment) => payment.paymentMonth === currentMonth,
  );

  return (
    <main className="mx-auto max-w-md p-8">
      {" "}
      <h1 className="text-3xl font-bold">{member.subscription.name} </h1>
      <p className="mt-2 text-gray-600">Hi {member.user.name}</p>
      {payment ? (
        <div className="mt-8 rounded-lg border p-6">
          <p className="text-sm text-gray-500">This month's payment</p>

          <p className="mt-2 text-3xl font-bold">
            €{(payment.amountCents / 100).toFixed(2)}
          </p>

          {payment.status === "paid" ? (
            <div className="mt-4 rounded bg-green-50 p-4">
              <p className="font-medium">Payment marked as paid ✓</p>

              {payment.paidAt && (
                <p className="mt-1 text-sm text-gray-600">
                  Paid on {payment.paidAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="mt-2">
                Status: <strong>Pending</strong>
              </p>

              <form action={markPaymentAsPaid.bind(null, payment.id)}>
                <button
                  type="submit"
                  className="mt-6 w-full rounded bg-black px-4 py-3 text-white"
                >
                  I've paid
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border p-6">
          <p>No payment has been generated yet.</p>
        </div>
      )}
    </main>
  );
}
