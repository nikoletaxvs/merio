import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { Badge, Card, MerioMark, SectionHeading } from "@/components/ui";
import {
  activateAllPayments,
  addMember,
  deleteMember,
  logout,
  remindMember,
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

  const paidPercentage =
    members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0;

  return (
    <main className="page-glow min-h-screen w-full bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header>
          <div className="flex items-center gap-3.5">
            {subscription.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={subscription.photoUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
                <MerioMark className="h-7 w-7 text-black" />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {subscription.familyName ?? subscription.name}
              </h1>
              <p className="mt-0.5 text-sm text-white/45">
                Spotify family subscription
              </p>
            </div>

            <Badge
              tone={paidCount === members.length ? "success" : "neutral"}
              className="ml-auto shrink-0 tabular-nums"
            >
              {paidCount}/{members.length} paid
            </Badge>

            <form action={logout} className="shrink-0">
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/50 transition hover:bg-white/[0.1] hover:text-white"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M12.5 6.5V5A1.5 1.5 0 0 0 11 3.5H5A1.5 1.5 0 0 0 3.5 5v10A1.5 1.5 0 0 0 5 16.5h6a1.5 1.5 0 0 0 1.5-1.5v-1.5m2-6.5L18 10l-3 3.5m3-3.5H7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  paidCount === members.length && members.length > 0
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-brand to-brand-hover"
                }`}
                style={{ width: `${paidPercentage}%` }}
              />
            </div>

            <span className="shrink-0 text-sm font-semibold tabular-nums text-white/70">
              {paidPercentage}%
            </span>
          </div>
        </header>

        {/* Overview */}
        <OverviewCard
          amountCents={subscription.amountCents}
          generationDay={subscription.generationDay}
          periodStart={periodStart}
          periodEnd={periodEnd}
          startDate={subscription.startDate}
          saveAction={updateBillingPeriod}
        />

        {/* Next period countdown */}
        <PeriodCountdown generationDay={subscription.generationDay} />

        {/* Members */}
        <section className="mt-10">
          <SectionHeading
            title="Members"
            description="Track this period's payments."
            action={
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-white/40 sm:block">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>

                <ActivateAllButton action={activateAllPayments} />
              </div>
            }
          />

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-lg shadow-black/20 ring-1 ring-inset ring-white/[0.02]">
            {members.length > 0 ? (
              <div className="divide-y divide-white/[0.07]">
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

        {/* Cron test */}
        <section className="mt-10">
          <SectionHeading
            title="Cron test"
            description="Simulate the notification cron for selected members on a chosen date and time."
          />

          <Card className="mt-4 border-white/10 bg-white/[0.04] shadow-none">
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

        {/* Add member & Family settings */}
        <div className="mt-10 grid gap-6 pb-10 lg:grid-cols-2 lg:items-start">
          <section>
            <SectionHeading
              title="Add member"
              description="Add someone to your subscription."
            />

            <Card className="mt-4 border-white/10 bg-white/[0.04] shadow-none">
              <AddMemberForm action={addMember} />
            </Card>
          </section>

          <section>
            <SectionHeading
              title="Family settings"
              description="Customize the name and photo shown to your members."
            />

            <Card className="mt-4 border-white/10 bg-white/[0.04] shadow-none">
              <FamilySettingsForm
                action={updateFamilySettings}
                familyName={subscription.familyName ?? ""}
                photoUrl={subscription.photoUrl ?? ""}
              />
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
