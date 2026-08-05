"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { members, payments } from "@/db/schema";

export async function markPaymentAsPaid(paymentId: number) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: {
      member: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  await db
    .update(payments)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  revalidatePath("/dashboard");
  revalidatePath(`/pay/${payment.member.token}`);
}
