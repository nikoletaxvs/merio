import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { addMember } from "./actions";

export default async function DashboardPage() {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.ownerId, 1),
    with: {
      members: {
        with: {
          user: true,
          payments: true,
        },
      },
    },
  });

  if (!subscription) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-bold">Spotify Payments</h1>
        <p className="mt-4 text-gray-600">You don't have a subscription yet.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">{subscription.name}</h1>
      <div className="mt-8 rounded-lg border p-6">
        <p className="text-sm text-gray-500">Monthly amount</p>

        <p className="mt-1 text-2xl font-semibold">
          €{(subscription.amountCents / 100).toFixed(2)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payment generated</p>
            <p className="font-medium">Day {subscription.generationDay}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment due</p>
            <p className="font-medium">Day {subscription.dueDay}</p>
          </div>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Members</h2>

        <div className="mt-4 space-y-3">
          {subscription.members.map((member) => {
            const currentMonth = new Date().toISOString().slice(0, 7);

            const payment = member.payments.find(
              (payment) => payment.paymentMonth === currentMonth,
            );

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>

                <div className="text-right">
                  {payment ? (
                    <>
                      <p className="font-medium">
                        €{(payment.amountCents / 100).toFixed(2)}
                      </p>

                      <p
                        className={
                          payment.status === "paid"
                            ? "text-sm text-green-600"
                            : "text-sm text-orange-600"
                        }
                      >
                        {payment.status}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No payment generated
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Add member</h2>

        <form action={addMember} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>

            <input
              name="name"
              required
              className="mt-1 w-full rounded border p-2"
              placeholder="George"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>

            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border p-2"
              placeholder="george@example.com"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Add member
          </button>
        </form>
      </section>
    </main>
  );
}
