import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { members, payments, subscriptions } from "@/db/schema";

export async function generatePayments() {
  const today = new Date();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const paymentMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

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

    for (const member of subscription.members) {
      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.memberId, member.id),
          eq(payments.paymentMonth, paymentMonth),
        ),
      });

      if (existingPayment) {
        continue;
      }

      const dueDate = new Date(currentYear, currentMonth, subscription.dueDay);

      await db.insert(payments).values({
        memberId: member.id,
        amountCents: subscription.amountCents,
        paymentMonth,
        dueDate,
        status: "pending",
      });

      generated++;
    }
  }

  return {
    generated,
    paymentMonth,
  };
}
