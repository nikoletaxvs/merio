import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { Badge, Button, Card, SpotifyMark } from "@/components/ui";
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
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <SpotifyMark className="h-10 w-10" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Spotify Payments
        </h1>
        <p className="mt-2 max-w-sm text-muted">
          You don&apos;t have a subscription yet. Create one to start splitting
          with friends.
        </p>
      </main>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const members = subscription.members.map((member) => {
    const payment = member.payments.find(
      (payment) => payment.paymentMonth === currentMonth,
    );

    return { ...member, payment };
  });

  const paidCount = members.filter(
    (member) => member.payment?.status === "paid",
  ).length;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <header className="flex items-center gap-2.5">
        <SpotifyMark className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {subscription.name}
          </h1>
          <p className="text-sm text-muted">
            {paidCount} of {members.length} members paid this month
          </p>
        </div>
      </header>

      <Card className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Monthly amount</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              €{(subscription.amountCents / 100).toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <p className="text-sm text-muted">Payment generated</p>
              <p className="mt-1 font-medium">Day {subscription.generationDay}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Payment due</p>
              <p className="mt-1 font-medium">Day {subscription.dueDay}</p>
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Members</h2>
          <Badge tone="neutral">{members.length} total</Badge>
        </div>

        <div className="mt-4 space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {initials(member.user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{member.user.name}</p>
                  <p className="truncate text-sm text-muted">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {member.payment ? (
                  <>
                    <p className="font-semibold">
                      €{(member.payment.amountCents / 100).toFixed(2)}
                    </p>
                    <Badge
                      tone={
                        member.payment.status === "paid" ? "success" : "pending"
                      }
                    >
                      {member.payment.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </>
                ) : (
                  <p className="text-sm text-muted">No payment generated</p>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <Card className="text-center text-muted">
              No members yet — add your first one below.
            </Card>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Add member</h2>

        <Card className="mt-4">
          <form action={addMember} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="George"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="george@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                Add member
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
