import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { getCurrentPeriod } from "@/lib/periods";

export async function generatePayments() {
  const today = new Date();

  const allSubscriptions = await db.query.subscriptions.findMany({
    with: {
      members: true,
    },
  });

  let generated = 0;

  for (const subscription of allSubscriptions) {
    if (subscription.generationDay !== today.getDate()) {
      continue;
    }

    const { start, end } = getCurrentPeriod(subscription.startDate);

    for (const member of subscription.members) {
      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.memberId, member.id),
          eq(payments.periodStart, start),
        ),
      });

      if (existingPayment) {
        continue;
      }

      await db.insert(payments).values({
        memberId: member.id,
        amountCents: subscription.amountCents,
        periodStart: start,
        periodEnd: end,
        status: "pending",
      });

      generated++;
    }
  }

  return {
    generated,
  };
}
