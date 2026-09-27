import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { members, payments, subscriptions, users } from "@/db/schema";
import { getCurrentPeriod, getPeriod, toDateString } from "@/lib/periods";

/**
 * Demo mode runs the app as a public sandbox: anyone can enter the dashboard
 * without a password, emails are logged instead of sent, and the data is
 * reset nightly. It must only ever be enabled on a deployment with its own
 * database, never on the one holding real data.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

/** Public URL of the demo deployment, linked from the real site's landing page. */
export function getDemoUrl(): string | null {
  if (isDemoMode()) {
    return "/login";
  }

  return process.env.DEMO_URL ?? null;
}

const DEMO_OWNER_EMAIL = "owner@demo.example.com";
const MEMBER_AMOUNT_CENTS = 300;
const PAST_PERIODS = 5;

const DEMO_MEMBERS = [
  { name: "Alex Carter", token: "demo-alex" },
  { name: "Sam Rivera", token: "demo-sam" },
  { name: "Jordan Lee", token: "demo-jordan" },
  { name: "Maya Patel", token: "demo-maya" },
  { name: "Chris Novak", token: "demo-chris" },
];

// Status per member for past periods (oldest → newest) and the current one.
// Mostly paid, with one late payer and a couple still pending this month so
// the dashboard shows every state.
const LATE_MEMBER = "demo-jordan";
const PAID_THIS_PERIOD = new Set(["demo-alex", "demo-maya"]);

/**
 * Wipes and reseeds the demo database. Refuses to run unless demo mode is on
 * AND the database is empty or already owned by the demo owner, so a
 * misconfigured DEMO_MODE on a real deployment can't destroy real data.
 */
export async function resetDemoData(today: Date = new Date()) {
  if (!isDemoMode()) {
    throw new Error("Refusing to reset: DEMO_MODE is not enabled");
  }

  const anyUser = await db.query.users.findFirst();
  const owner = await db.query.users.findFirst({ where: eq(users.id, 1) });

  if (anyUser && owner?.email !== DEMO_OWNER_EMAIL) {
    throw new Error(
      "Refusing to reset: this database is not owned by the demo account",
    );
  }

  // Current period started a few days ago, with PAST_PERIODS of history.
  // Day is capped at 28 so every month has it.
  const anchor = new Date(today);
  anchor.setDate(anchor.getDate() - 5);
  const startDay = Math.min(anchor.getDate(), 28);
  const startDate = toDateString(
    new Date(anchor.getFullYear(), anchor.getMonth() - PAST_PERIODS, startDay),
  );
  const current = getCurrentPeriod(startDate, today);

  await db.transaction(async (tx) => {
    // RESTART IDENTITY makes the owner id 1 again, which the dashboard expects.
    await tx.execute(
      sql`TRUNCATE ${payments}, ${members}, ${subscriptions}, ${users} RESTART IDENTITY CASCADE`,
    );

    const [ownerRow] = await tx
      .insert(users)
      .values({ name: "Demo Owner", email: DEMO_OWNER_EMAIL })
      .returning();

    const [subscription] = await tx
      .insert(subscriptions)
      .values({
        ownerId: ownerRow.id,
        name: "Spotify Family",
        familyName: "The Demo Family",
        amountCents: MEMBER_AMOUNT_CENTS,
        startDate,
        generationDay: startDay,
      })
      .returning();

    for (const demoMember of DEMO_MEMBERS) {
      const [user] = await tx
        .insert(users)
        .values({
          name: demoMember.name,
          email: `${demoMember.token}@demo.example.com`,
        })
        .returning();

      const [member] = await tx
        .insert(members)
        .values({
          subscriptionId: subscription.id,
          userId: user.id,
          token: demoMember.token,
        })
        .returning();

      for (let i = 0; i <= PAST_PERIODS; i++) {
        const period = getPeriod(
          new Date(anchor.getFullYear(), anchor.getMonth() - PAST_PERIODS + i, startDay),
          startDate,
        );
        const isCurrent = period.start === current.start;
        const isLastPast = i === PAST_PERIODS - 1;

        const paid = isCurrent
          ? PAID_THIS_PERIOD.has(demoMember.token)
          : !(isLastPast && demoMember.token === LATE_MEMBER);

        const paidAt = new Date(`${period.start}T12:00:00`);
        paidAt.setDate(paidAt.getDate() + 1 + (i % 3));

        await tx.insert(payments).values({
          memberId: member.id,
          amountCents: MEMBER_AMOUNT_CENTS,
          periodStart: period.start,
          periodEnd: period.end,
          status: paid ? "paid" : "pending",
          paidAt: paid ? paidAt : null,
        });
      }
    }
  });
}

/** Seeds the demo database on first use so a fresh deployment isn't empty. */
export async function ensureDemoData() {
  if (!isDemoMode()) {
    return;
  }

  if (!(await db.query.users.findFirst())) {
    await resetDemoData();
  }
}
