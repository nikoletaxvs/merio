"use server";

import crypto from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { members, payments, subscriptions, users } from "@/db/schema";
import { generatePayments } from "./payment-generation";
import { sendReminderToMember } from "./period-reminders";

export async function activateAllPayments() {
  await generatePayments();
  revalidatePath("/dashboard");
}

export async function remindMember(memberId: number) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";

  await sendReminderToMember(memberId, `${proto}://${host}`);
  revalidatePath("/dashboard");
}

export async function updateFamilySettings(formData: FormData) {
  const familyName = formData.get("familyName");
  const photoUrl = formData.get("photoUrl");

  if (
    (typeof familyName !== "string" || familyName.trim() === "") &&
    (typeof photoUrl !== "string" || photoUrl.trim() === "")
  ) {
    throw new Error("Provide a family name or photo URL");
  }

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
}

export async function createSubscription(formData: FormData) {
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
    throw new Error("Invalid form data");
  }

  await db.insert(subscriptions).values({
    ownerId: 1,
    name,
    amountCents: Number(amountCents),
    startDate,
    generationDay: Number(generationDay),
  });
}
export async function updateMember(
  memberId: number,
  formData: FormData,
): Promise<void> {
  const name = formData.get("name");
  const email = formData.get("email");

  if (typeof name !== "string" || typeof email !== "string") {
    throw new Error("Invalid form data");
  }

  if (name.trim() === "" || email.trim() === "") {
    throw new Error("Name and email are required");
  }

  const member = await db.query.members.findFirst({
    where: eq(members.id, memberId),
    with: { user: true },
  });

  if (!member) {
    throw new Error("Member not found");
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
      throw new Error("Another user already uses this email");
    }
  }

  await db
    .update(users)
    .set({ name: name.trim(), email: normalizedEmail })
    .where(eq(users.id, member.userId));

  revalidatePath("/dashboard");
}

export async function deleteMember(memberId: number): Promise<void> {
  await db.delete(payments).where(eq(payments.memberId, memberId));
  await db.delete(members).where(eq(members.id, memberId));

  revalidatePath("/dashboard");
}

export async function addMember(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");

  if (typeof name !== "string" || typeof email !== "string") {
    throw new Error("Invalid form data");
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.ownerId, 1),
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    const insertedUsers = await db
      .insert(users)
      .values({
        name,
        email,
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
    throw new Error("This user is already a member");
  }

  const token = crypto.randomBytes(24).toString("hex");

  await db.insert(members).values({
    subscriptionId: subscription.id,
    userId: user.id,
    token,
  });
}
