"use server";

import crypto from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { members, payments, subscriptions, users } from "@/db/schema";
import { endSession, isAuthenticated } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { generatePayments } from "./payment-generation";
import { sendPeriodStartReminders, sendReminderToMember } from "./period-reminders";

export type ActionState = { error: string } | null;
export type TestRemindersState =
  | {
      error?: string;
      sent?: number;
      skipped?: number;
      notDue?: number;
      created?: number;
    }
  | null;

async function guard(): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { error: "Your session expired. Please sign in again." };
  }

  return null;
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
    where: eq(subscriptions.ownerId, 1),
    with: { members: true },
  });

  if (!subscription) {
    return null;
  }

  const allowedIds = new Set(subscription.members.map((member) => member.id));

  return memberIds.filter((id) => allowedIds.has(id));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}

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

export async function remindMember(
  memberId: number,
): Promise<{ error?: string }> {
  if (!(await isAuthenticated())) {
    return { error: "Your session expired. Please sign in again." };
  }

  try {
    const baseUrl = await getBaseUrl();

    const result = await sendReminderToMember(memberId, baseUrl);
    revalidatePath("/dashboard");

    if (!result.sent) {
      return { error: "This member already marked the payment as paid." };
    }

    return {};
  } catch {
    return { error: "Reminder email couldn't be sent. Try again later." };
  }
}

export async function deleteMember(
  memberId: number,
): Promise<{ error?: string }> {
  if (!(await isAuthenticated())) {
    return { error: "Your session expired. Please sign in again." };
  }

  try {
    await db.delete(payments).where(eq(payments.memberId, memberId));
    await db.delete(members).where(eq(members.id, memberId));

    revalidatePath("/dashboard");

    return {};
  } catch {
    return { error: "Member couldn't be removed. Try again." };
  }
}

export async function updateMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const memberId = Number(formData.get("memberId"));
  const name = formData.get("name");
  const email = formData.get("email");

  if (!Number.isInteger(memberId)) {
    return { error: "Invalid member." };
  }

  if (typeof name !== "string" || typeof email !== "string") {
    return { error: "Invalid form data." };
  }

  if (name.trim() === "" || email.trim() === "") {
    return { error: "Name and email are required." };
  }

  try {
    const member = await db.query.members.findFirst({
      where: eq(members.id, memberId),
      with: { user: true },
    });

    if (!member) {
      return { error: "Member not found." };
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== member.user.email) {
      const conflicting = await db.query.users.findFirst({
        where: and(
          eq(users.email, normalizedEmail),
          ne(users.id, member.userId),
        ),
      });

      if (conflicting) {
        return { error: "Another user already uses this email." };
      }
    }

    await db
      .update(users)
      .set({ name: name.trim(), email: normalizedEmail })
      .where(eq(users.id, member.userId));

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Changes couldn't be saved. Try again." };
  }
}

export async function updateBillingPeriod(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const startDate = formData.get("startDate");
  const generationDay = formData.get("generationDay");

  if (typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return { error: "Pick a valid start date." };
  }

  const day = Number(generationDay);

  if (!Number.isInteger(day) || day < 1 || day > 28) {
    return { error: "Generation day must be between 1 and 28." };
  }

  try {
    await db
      .update(subscriptions)
      .set({ startDate, generationDay: day })
      .where(eq(subscriptions.ownerId, 1));

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Settings couldn't be saved. Try again." };
  }
}

export async function updateFamilySettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const familyName = formData.get("familyName");
  const photoUrl = formData.get("photoUrl");

  if (
    (typeof familyName !== "string" || familyName.trim() === "") &&
    (typeof photoUrl !== "string" || photoUrl.trim() === "")
  ) {
    return { error: "Provide a family name or photo URL." };
  }

  try {
    await db
      .update(subscriptions)
      .set({
        familyName:
          typeof familyName === "string" && familyName.trim()
            ? familyName.trim()
            : undefined,
        photoUrl:
          typeof photoUrl === "string" && photoUrl.trim()
            ? photoUrl.trim()
            : undefined,
      })
      .where(eq(subscriptions.ownerId, 1));

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Settings couldn't be saved. Try again." };
  }
}

export async function createSubscription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const name = formData.get("name");
  const amountCents = formData.get("amountCents");
  const startDate = formData.get("startDate");
  const generationDay = formData.get("generationDay");

  if (
    typeof name !== "string" ||
    typeof amountCents !== "string" ||
    typeof startDate !== "string" ||
    typeof generationDay !== "string"
  ) {
    return { error: "Invalid form data." };
  }

  try {
    await db.insert(subscriptions).values({
      ownerId: 1,
      name,
      amountCents: Number(amountCents),
      startDate,
      generationDay: Number(generationDay),
    });

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Subscription couldn't be created. Try again." };
  }
}

export async function addMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  const name = formData.get("name");
  const email = formData.get("email");

  if (typeof name !== "string" || typeof email !== "string") {
    return { error: "Invalid form data." };
  }

  if (name.trim() === "" || email.trim() === "") {
    return { error: "Name and email are required." };
  }

  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.ownerId, 1),
    });

    if (!subscription) {
      return { error: "Create a subscription first." };
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      const insertedUsers = await db
        .insert(users)
        .values({
          name: name.trim(),
          email: normalizedEmail,
        })
        .returning();
      user = insertedUsers[0];
    }

    const existingMember = await db.query.members.findFirst({
      where: and(
        eq(members.subscriptionId, subscription.id),
        eq(members.userId, user.id),
      ),
    });

    if (existingMember) {
      return { error: "This person is already a member." };
    }

    const token = crypto.randomBytes(24).toString("hex");

    await db.insert(members).values({
      subscriptionId: subscription.id,
      userId: user.id,
      token,
    });

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Member couldn't be added. Try again." };
  }
}
