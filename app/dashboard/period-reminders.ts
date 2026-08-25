import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { members, payments } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import {
  formatPeriod,
  getCurrentPeriod,
  parseDate,
  toDateString,
} from "@/lib/periods";

/**
 * Reminder cadence: day 1 (period start), day 7, then weekly.
 */
export function daysSincePeriodStart(
  periodStart: string,
  today: Date,
): number {
  const start = parseDate(periodStart);
  const now = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.round((now.getTime() - start.getTime()) / 86400000);
}

export function shouldSendReminder(daysSinceStart: number): boolean {
  if (daysSinceStart < 0) {
    return false;
  }

  return (
    daysSinceStart === 0 ||
    daysSinceStart === 6 ||
    (daysSinceStart > 6 && (daysSinceStart - 6) % 7 === 0)
  );
}

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

    const daysSinceStart = daysSincePeriodStart(periodStart, today);

    if (!shouldSendReminder(daysSinceStart)) {
      continue;
    }

    const isFollowUp = daysSinceStart > 0;

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
        subject: isFollowUp
          ? `Reminder: your ${familyNameOf(subscription)} payment is still pending`
          : `Your ${familyNameOf(subscription)} payment for ${formatPeriod(periodStart, periodEnd)}`,
        html: reminderEmailHtml({
          name: member.user.name,
          subscriptionName: subscription.name,
          familyName: familyNameOf(subscription),
          photoUrl: subscription.photoUrl,
          amountCents: payment.amountCents,
          period: formatPeriod(periodStart, periodEnd),
          payUrl: `${baseUrl}/pay/${member.token}`,
          isFollowUp,
          dueDate: toDateString(parseDate(periodEnd)),
        }),
        text: reminderEmailText({
          name: member.user.name,
          subscriptionName: subscription.name,
          amountCents: payment.amountCents,
          period: formatPeriod(periodStart, periodEnd),
          payUrl: `${baseUrl}/pay/${member.token}`,
          dueDate: toDateString(parseDate(periodEnd)),
        }),
      });

      reminded++;
    }
  }

  return {
    reminded,
  };
}

export async function sendReminderToMember(memberId: number, baseUrl: string) {
  const member = await db.query.members.findFirst({
    where: eq(members.id, memberId),
    with: {
      user: true,
      subscription: true,
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const { start: periodStart, end: periodEnd } = getCurrentPeriod(
    member.subscription.startDate,
  );

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
        amountCents: member.subscription.amountCents,
        periodStart,
        periodEnd,
        status: "pending",
      })
      .returning();

    payment = inserted[0];
  }

  if (payment.status === "paid") {
    return { sent: false };
  }

  await sendEmail({
    to: { email: member.user.email, name: member.user.name },
    subject: `Your ${familyNameOf(member.subscription)} payment for ${formatPeriod(periodStart, periodEnd)}`,
    html: reminderEmailHtml({
      name: member.user.name,
      subscriptionName: member.subscription.name,
      familyName: familyNameOf(member.subscription),
      photoUrl: member.subscription.photoUrl,
      amountCents: payment.amountCents,
      period: formatPeriod(periodStart, periodEnd),
      payUrl: `${baseUrl}/pay/${member.token}`,
      isFollowUp: false,
      dueDate: toDateString(parseDate(periodEnd)),
    }),
    text: reminderEmailText({
      name: member.user.name,
      subscriptionName: member.subscription.name,
      amountCents: payment.amountCents,
      period: formatPeriod(periodStart, periodEnd),
      payUrl: `${baseUrl}/pay/${member.token}`,
      dueDate: toDateString(parseDate(periodEnd)),
    }),
  });

  return { sent: true };
}

function reminderEmailHtml({
  name,
  subscriptionName,
  familyName,
  photoUrl,
  amountCents,
  period,
  payUrl,
  isFollowUp,
  dueDate,
}: {
  name: string;
  subscriptionName: string;
  familyName: string;
  photoUrl?: string | null;
  amountCents: number;
  period: string;
  payUrl: string;
  isFollowUp: boolean;
  dueDate: string;
}) {
  const amount = (amountCents / 100).toFixed(2);

  const intro = isFollowUp
    ? `A quick nudge — your <strong>${subscriptionName}</strong> payment for <strong>${period}</strong> is still pending.`
    : `Your <strong>${subscriptionName}</strong> payment for the period <strong>${period}</strong> is ready.`;

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
            ${intro}
          </p>
          <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">€${amount}</p>
          <p style="margin:0 0 24px;color:#888;font-size:13px">Period ${period} · due by ${dueDate}</p>
          <a href="${payUrl}" style="display:inline-block;background:#6d5bd0;color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:15px">View and confirm payment</a>
          <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.5">
            Or copy this link into your browser:<br/>
            <a href="${payUrl}" style="color:#6d5bd0">${payUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function reminderEmailText({
  name,
  subscriptionName,
  amountCents,
  period,
  payUrl,
  dueDate,
}: {
  name: string;
  subscriptionName: string;
  amountCents: number;
  period: string;
  payUrl: string;
  dueDate: string;
}) {
  return [
    `Hi ${name},`,
    "",
    `Your ${subscriptionName} payment for ${period} (${(amountCents / 100).toFixed(2)} EUR) is ready.`,
    `Due by ${dueDate}.`,
    "",
    `Open your payment page to confirm: ${payUrl}`,
    "",
    "— Merio",
  ].join("\n");
}

function familyNameOf(subscription: { name: string; familyName?: string | null }) {
  return subscription.familyName ?? subscription.name;
}
