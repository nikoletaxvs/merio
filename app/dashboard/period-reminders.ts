import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { payments } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { formatPeriod, getCurrentPeriod } from "@/lib/periods";

export async function sendPeriodStartReminders(
  baseUrl: string,
  today: Date = new Date(),
) {
  const allSubscriptions = await db.query.subscriptions.findMany({
    with: {
      members: {
        with: {
          user: true,
        },
      },
    },
  });

  let reminded = 0;

  for (const subscription of allSubscriptions) {
    const { start: periodStart, end: periodEnd } = getCurrentPeriod(
      subscription.startDate,
      today,
    );

    for (const member of subscription.members) {
      let payment = await db.query.payments.findFirst({
        where: and(
          eq(payments.memberId, member.id),
          eq(payments.periodStart, periodStart),
        ),
      });

      if (!payment) {
        const inserted = await db
          .insert(payments)
          .values({
            memberId: member.id,
            amountCents: subscription.amountCents,
            periodStart,
            periodEnd,
            status: "pending",
          })
          .returning();

        payment = inserted[0];
      }

      if (payment.status === "paid") {
        continue;
      }

      await sendEmail({
        to: { email: member.user.email, name: member.user.name },
        subject: `Your ${familyNameOf(subscription)} payment is ready`,
        html: reminderEmailHtml({
          name: member.user.name,
          subscriptionName: subscription.name,
          familyName: familyNameOf(subscription),
          photoUrl: subscription.photoUrl,
          amountCents: payment.amountCents,
          period: formatPeriod(periodStart, periodEnd),
          payUrl: `${baseUrl}/pay/${member.token}`,
        }),
      });

      reminded++;
    }
  }

  return {
    reminded,
  };
}

function reminderEmailHtml({
  name,
  subscriptionName,
  familyName,
  photoUrl,
  amountCents,
  period,
  payUrl,
}: {
  name: string;
  subscriptionName: string;
  familyName: string;
  photoUrl?: string | null;
  amountCents: number;
  period: string;
  payUrl: string;
}) {
  const amount = (amountCents / 100).toFixed(2);

  return `
    <div style="background:#f5f5f5;padding:32px;font-family:Arial,sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
        <div style="background:#6d5bd0;padding:24px;text-align:center">
          ${
            photoUrl
              ? `<img src="${photoUrl}" alt="" style="width:64px;height:64px;border-radius:16px;object-fit:cover;display:inline-block;vertical-align:middle"/>`
              : ""
          }
          <h1 style="margin:12px 0 0;font-size:20px;color:#fff">${familyName}</h1>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;font-size:18px;color:#111">Hi ${name},</h2>
          <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.6">
            Your <strong>${subscriptionName}</strong> payment for the period
            <strong>${period}</strong> is ready.
          </p>
          <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111">€${amount}</p>
          <a href="${payUrl}" style="display:inline-block;background:#6d5bd0;color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px">Pay now</a>
          <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.5">
            Or copy this link into your browser:<br/>
            <a href="${payUrl}" style="color:#6d5bd0">${payUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function familyNameOf(subscription: { name: string; familyName?: string | null }) {
  return subscription.familyName ?? subscription.name;
}
