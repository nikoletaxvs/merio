import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { Card, SectionHeading } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { getCurrentPeriod } from "@/lib/billing/periods";
import { isDemoMode } from "@/lib/demo";
import { OWNER_ID } from "@/lib/owner";
import ActivateAllButton from "./_components/ActivateAllButton";
import AddMemberForm from "./_components/AddMemberForm";
import CronTestPanel from "./_components/CronTestPanel";
import DashboardHeader from "./_components/DashboardHeader";
import DemoBanner from "./_components/DemoBanner";
import FamilySettingsForm from "./_components/FamilySettingsForm";
import MemberRow from "./_components/member-row/MemberRow";
import NoSubscription from "./_components/NoSubscription";
import OverviewCard from "./_components/OverviewCard";
import PeriodCountdown from "./_components/PeriodCountdown";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireOwner();

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.ownerId, OWNER_ID),
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
    return <NoSubscription />;
  }

  const { start: periodStart, end: periodEnd } = getCurrentPeriod(
    subscription.startDate,
  );
  const members = subscription.members;
  const demo = isDemoMode();

  return (
    <main className="min-h-dvh w-full">
      {demo && <DemoBanner />}

      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-12">
        <DashboardHeader
          name={subscription.name}
          familyName={subscription.familyName}
          photoUrl={subscription.photoUrl}
          paidByMember={members.map((member) => ({
            id: member.id,
            paid: member.payments.some(
              (payment) =>
                payment.periodStart === periodStart && payment.status === "paid",
            ),
          }))}
          // In demo mode, signing out would just sign the visitor back in.
          showSignOut={!demo}
        />

        <OverviewCard
          amountCents={subscription.amountCents}
          generationDay={subscription.generationDay}
          periodStart={periodStart}
          periodEnd={periodEnd}
          startDate={subscription.startDate}
        />

        <PeriodCountdown generationDay={subscription.generationDay} />

        <section className="mt-12">
          <SectionHeading
            title="Members"
            description="Who owes what this period."
            action={<ActivateAllButton />}
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
                    user: { name: member.user.name, email: member.user.email },
                    payments: member.payments.map((payment) => ({
                      id: payment.id,
                      amountCents: payment.amountCents,
                      periodStart: payment.periodStart,
                      periodEnd: payment.periodEnd,
                      status: payment.status,
                      paidAt: payment.paidAt,
                    })),
                  }}
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
              <AddMemberForm />
            </div>
          </section>

          <section>
            <SectionHeading
              title="Family settings"
              description="Name and photo shown on members' pay pages."
            />

            <div className="mt-4">
              <FamilySettingsForm
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
            />
          </Card>
        </section>
      </div>
    </main>
  );
}
