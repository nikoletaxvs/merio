import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { Badge, Button, Card, MerioMark, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/icon";
import {
  activateAllPayments,
  addMember,
  deleteMember,
  logout,
  remindMember,
  resetDemo,
  testCronReminders,
  updateBillingPeriod,
  updateFamilySettings,
  updateMember,
} from "./actions";
import {
  ActivateAllButton,
  AddMemberForm,
  CronTestPanel,
  FamilySettingsForm,
} from "./forms";
import MemberRow from "./MemberRow";
import OverviewCard from "./OverviewCard";
import PeriodCountdown from "./PeriodCountdown";
import { getCurrentPeriod } from "@/lib/periods";
import { requireOwner } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireOwner();

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
      <main className="flex min-h-screen w-full flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="flex max-w-sm flex-col items-center">
          <MerioMark className="h-10 w-10" />

          <h1 className="mt-6 font-display text-2xl font-medium">
            No subscription yet
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Once a subscription exists, its members and payments show up here.
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

  const demo = isDemoMode();

  const allPaid = members.length > 0 && paidCount === members.length;

  return (
    <main className="min-h-screen w-full">
      {demo && (
        <div className="border-b border-border bg-surface-muted">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 text-sm sm:px-6">
            <p className="flex-1 text-muted">
              <span className="font-medium text-foreground">Demo.</span> Sample
              data, reset every night. Emails are logged, not sent. Open a
              member below to see their pay page.
            </p>

            <form action={resetDemo}>
              <Button type="submit" variant="secondary" size="sm">
                Reset data
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
        <header>
          <div className="flex items-start gap-4">
            {subscription.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={subscription.photoUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
              />
            ) : (
              <MerioMark className="h-12 w-12 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-3xl font-medium">
                {subscription.familyName ?? subscription.name}
              </h1>
              {subscription.familyName && (
                <p className="mt-0.5 text-sm text-muted">{subscription.name}</p>
              )}
            </div>

            {/* In demo mode, signing out would just sign the visitor back in. */}
            {!demo && (
              <form action={logout} className="shrink-0">
                <Button type="submit" variant="ghost" size="sm">
                  <Icon name="logout" className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </form>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <p className="text-muted">
                <span className="font-mono font-medium text-foreground">{paidCount}</span>{" "}
                of{" "}
                <span className="font-mono font-medium text-foreground">
                  {members.length}
                </span>{" "}
                paid this period
              </p>

              {allPaid && <Badge tone="success">All settled</Badge>}
            </div>

            {/* One cell per member, like ticks in a ledger column. */}
            <div className="mt-3 flex gap-1" aria-hidden="true">
              {members.map((member) => (
                <span
                  key={member.id}
                  className={`h-2 flex-1 rounded-sm ${
                    member.payment?.status === "paid"
                      ? "bg-accent"
                      : "border border-border-strong"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <OverviewCard
          amountCents={subscription.amountCents}
          generationDay={subscription.generationDay}
          periodStart={periodStart}
          periodEnd={periodEnd}
          startDate={subscription.startDate}
          saveAction={updateBillingPeriod}
        />

        <PeriodCountdown generationDay={subscription.generationDay} />

        <section className="mt-12">
          <SectionHeading
            title="Members"
            description="Who owes what this period."
            action={<ActivateAllButton action={activateAllPayments} />}
          />

          {members.length > 0 ? (
            <div className="divide-y divide-border border-b border-border">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  currentPeriodStart={periodStart}
                  member={{
                    id: member.id,
                    token: member.token,
                    user: {
                      name: member.user.name,
                      email: member.user.email,
                    },
                    payments: member.payments.map((payment) => ({
                      id: payment.id,
                      amountCents: payment.amountCents,
                      periodStart: payment.periodStart,
                      periodEnd: payment.periodEnd,
                      status: payment.status,
                      paidAt: payment.paidAt,
                    })),
                  }}
                  remindAction={remindMember}
                  updateAction={updateMember}
                  deleteAction={deleteMember}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              No members yet. Add the first one below.
            </p>
          )}
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <section>
            <SectionHeading title="Add member" />

            <div className="mt-4">
              <AddMemberForm action={addMember} />
            </div>
          </section>

          <section>
            <SectionHeading
              title="Family settings"
              description="Name and photo shown on members' pay pages."
            />

            <div className="mt-4">
              <FamilySettingsForm
                action={updateFamilySettings}
                familyName={subscription.familyName ?? ""}
                photoUrl={subscription.photoUrl ?? ""}
              />
            </div>
          </section>
        </div>

        <section className="mt-12 pb-10">
          <SectionHeading
            title="Test the reminder cron"
            description="Run the reminder job for chosen members as if it were another date and time."
          />

          <Card className="mt-4">
            <CronTestPanel
              members={members.map((member) => ({
                id: member.id,
                name: member.user.name,
                email: member.user.email,
              }))}
              action={testCronReminders}
            />
          </Card>
        </section>
      </div>
    </main>
  );
}
