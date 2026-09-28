"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getBaseUrl } from "@/lib/base-url";
import { generatePayments } from "@/lib/billing/generate-payments";
import { sendPeriodStartReminders } from "@/lib/billing/reminders";
import { OWNER_ID } from "@/lib/owner";
import { type ActionState, guard, type TestRemindersState } from "./shared";

export async function activateAllPayments(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prev: ActionState,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  try {
    await generatePayments();
    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Couldn't generate payments. Try again." };
  }
}

export async function testCronReminders(
  _prev: TestRemindersState,
  formData: FormData,
): Promise<TestRemindersState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const memberIds = await selectedOwnerMemberIds(formData);

  if (memberIds === null) {
    return { error: "No subscription found." };
  }

  if (memberIds.length === 0) {
    return { error: "Select at least one member." };
  }

  const sim = simulatedDate(formData);

  if (sim === "invalid") {
    return { error: "Pick a valid date and time." };
  }

  try {
    const baseUrl = await getBaseUrl();

    const { reminded, skipped, notDue, created } =
      await sendPeriodStartReminders(baseUrl, sim ?? new Date(), {
        memberIds,
        isTest: true,
        ignoreCadence: true,
      });

    revalidatePath("/dashboard");

    return { sent: reminded, skipped, notDue, created };
  } catch {
    return { error: "Test reminders couldn't be sent. Try again." };
  }
}

function simulatedDate(formData: FormData): Date | "invalid" | null {
  const raw = formData.get("simTimestamp");

  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  const date = new Date(raw);

  return isNaN(date.getTime()) ? "invalid" : date;
}

async function selectedOwnerMemberIds(
  formData: FormData,
): Promise<number[] | null> {
  const memberIds = formData
    .getAll("memberIds")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id));

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.ownerId, OWNER_ID),
    with: { members: true },
  });

  if (!subscription) {
    return null;
  }

  const allowedIds = new Set(subscription.members.map((member) => member.id));//why use set

  return memberIds.filter((id) => allowedIds.has(id));// why filter here and use set before
}
