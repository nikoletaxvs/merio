import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { Badge, Button, Card, MerioMark } from "@/components/ui";
import {
  activateAllPayments,
  addMember,
  remindMember,
  updateFamilySettings,
} from "./actions";
import CopyPaymentLinkButton from "./CopyPaymentLink";
import { formatPeriod, getCurrentPeriod } from "@/lib/periods";

export const dynamic = "force-dynamic";

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
      <main className="flex min-h-screen w-full flex-1 items-center justify-center bg-black px-6 py-16 text-center text-white">
        <div className="flex max-w-sm flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
            <MerioMark className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">Merio</h1>

          <p className="mt-2 text-sm leading-6 text-white/50">
            You don&apos;t have a subscription yet. Create one to start
            splitting your payments with friends.
          </p>
        </div>
      </main>
    );
  }

  const { start: periodStart, end: periodEnd } = getCurrentPeriod(
    subscription.startDate,
  );

  const members = subscription.members.map((member) => {
    const payment = member.payments.find(
      (payment) => payment.periodStart === periodStart,
    );

    return { ...member, payment };
  });

  const paidCount = members.filter(
    (member) => member.payment?.status === "paid",
  ).length;

  const totalAmount = subscription.amountCents / 100;
  const paidPercentage =
    members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0;

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {subscription.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={subscription.photoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand">
                <MerioMark className="h-6 w-6 text-black" />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {subscription.familyName ?? subscription.name}
              </h1>
              <p className="mt-0.5 text-sm text-white/45">
                {paidCount} of {members.length} members paid this period
              </p>
            </div>
          </div>

          <Badge tone={paidCount === members.length ? "success" : "neutral"}>
            {paidPercentage}%
          </Badge>
        </header>

        {/* Overview */}
        <Card className="mt-8 overflow-hidden border-white/10 bg-white/[0.04] shadow-none">
          <div className="grid divide-y divide-white/[0.08] sm:grid-cols-[1.2fr_1fr_1fr] sm:divide-x sm:divide-y-0">
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/45">Monthly amount</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                €{totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/45">Payment generated</p>
              <p className="mt-1 font-semibold">
                Day {subscription.generationDay}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/45">Billing period</p>
              <p className="mt-1 font-semibold">
                {formatPeriod(periodStart, periodEnd)}
              </p>
            </div>
          </div>
        </Card>

        {/* Members */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                Members
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Track this period&apos;s payments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>

              <form action={activateAllPayments}>
                <Button type="submit" variant="secondary" className="!px-4 !py-2 text-xs">
                  Activate all
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {members.length > 0 ? (
              <div className="divide-y divide-white/[0.07]">
                {members.map((member) => {
                  const isPaid = member.payment?.status === "paid";

                  return (
                    <div
                      key={member.id}
                      className="group flex flex-col gap-4 p-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand ring-1 ring-brand/10">
                          {initials(member.user.name)}
                        </span>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate font-medium text-white">
                              {member.user.name}
                            </p>

                            <CopyPaymentLinkButton token={member.token} />
                          </div>

                          <p className="mt-0.5 truncate text-sm text-white/40">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pl-13 sm:justify-end sm:pl-0">
                        {member.payment ? (
                          <>
                            <p className="font-semibold tabular-nums">
                              €{(member.payment.amountCents / 100).toFixed(2)}
                            </p>

                            {!isPaid && (
                              <form action={remindMember.bind(null, member.id)}>
                                <Button
                                  type="submit"
                                  variant="secondary"
                                  className="!px-3 !py-1.5 text-xs"
                                >
                                  Remind
                                </Button>
                              </form>
                            )}

                            <Badge tone={isPaid ? "success" : "pending"}>
                              {isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </>
                        ) : (
                          <p className="text-sm text-white/35">
                            No payment yet
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
                  <span className="text-lg text-white/40">+</span>
                </div>

                <p className="mt-4 font-medium">No members yet</p>
                <p className="mt-1 text-sm text-white/40">
                  Add your first member below to start splitting payments.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Add member */}
        <section className="mt-10 pb-10">
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Add member
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Add someone to your subscription.
            </p>
          </div>

          <Card className="mt-4 border-white/10 bg-white/[0.04] shadow-none">
            <form action={addMember} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/80"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  required
                  placeholder="George"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-brand/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand/10"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="george@example.com"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-brand/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand/10"
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

        {/* Family settings */}
        <section className="mt-10 pb-10">
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Family settings
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Customize the name and photo shown to your members.
            </p>
          </div>

          <Card className="mt-4 border-white/10 bg-white/[0.04] shadow-none">
            <form action={updateFamilySettings} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="familyName"
                  className="block text-sm font-medium text-white/80"
                >
                  Family name
                </label>

                <input
                  id="familyName"
                  name="familyName"
                  defaultValue={subscription.familyName ?? ""}
                  placeholder="e.g. The Smiths"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-brand/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand/10"
                />
              </div>

              <div>
                <label
                  htmlFor="photoUrl"
                  className="block text-sm font-medium text-white/80"
                >
                  Photo URL
                </label>

                <input
                  id="photoUrl"
                  name="photoUrl"
                  defaultValue={subscription.photoUrl ?? ""}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-brand/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-brand/10"
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Save
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
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
