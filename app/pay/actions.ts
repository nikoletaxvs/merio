"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { members, payments } from "@/db/schema";
import { getCurrentPeriod } from "@/lib/periods";

// Server actions are public POST endpoints, so never trust a payment id sent
// by the client. The member's secret token is the only credential: we derive
// the payment from it on the server, so a token can only settle its own
// current-period payment.
export async function markPaymentAsPaid(token: string) {
  const member = await db.query.members.findFirst({
    where: eq(members.token, token),
    with: {
      subscription: true,
    },
  });

  if (!member) {
    throw new Error("Payment link not found");
  }

  const { start: periodStart } = getCurrentPeriod(
    member.subscription.startDate,
  );

  // Skip payments that are already paid so a repeat submit keeps the original paidAt.
  await db
    .update(payments)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(
      and(
        eq(payments.memberId, member.id),
        eq(payments.periodStart, periodStart),
        ne(payments.status, "paid"),
      ),
    );

  revalidatePath("/dashboard");
  revalidatePath(`/pay/${token}`);
}
