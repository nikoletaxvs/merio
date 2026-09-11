import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { getCurrentPeriod } from "@/lib/periods";

export async function generatePayments({
  memberIds,
  today = new Date(),
}: { memberIds?: number[]; today?: Date } = {}) {
  const allowedIds = memberIds ? new Set(memberIds) : null;

  const allSubscriptions = await db.query.subscriptions.findMany({
    with: {
      members: true,
    },
  });

  let generated = 0;
  let upToDate = 0;

  for (const subscription of allSubscriptions) {
    const { start, end } = getCurrentPeriod(subscription.startDate, today);

    for (const member of subscription.members) {
      if (allowedIds && !allowedIds.has(member.id)) {
        continue;
      }

      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.memberId, member.id),
          eq(payments.periodStart, start),
        ),
      });

      if (existingPayment) {
        upToDate++;
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
    upToDate,
  };
}
