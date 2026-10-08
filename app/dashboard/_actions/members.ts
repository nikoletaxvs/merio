"use server";

import crypto from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { members, payments, subscriptions, users } from "@/db/schema";
import { getBaseUrl } from "@/lib/base-url";
import { generatePayments } from "@/lib/billing/generate-payments";
import { sendReminderToMember } from "@/lib/billing/reminders";
import { OWNER_ID } from "@/lib/owner";
import { type ActionState, guard } from "./shared";

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
      where: eq(subscriptions.ownerId, OWNER_ID),
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

    const [inserted] = await db
      .insert(members)
      .values({
        subscriptionId: subscription.id,
        userId: user.id,
        token,
      })
      .returning({ id: members.id });

    await generatePayments({ memberIds: [inserted.id] });

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Member couldn't be added. Try again." };
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

export async function deleteMember(
  memberId: number,
): Promise<{ error?: string }> {
  const denied = await guard();

  if (denied) {
    return denied;
  }

  try {
    // One transaction, so a failure part-way leaves everything as it was.
    await db.transaction(async (tx) => {
      await tx.delete(payments).where(eq(payments.memberId, memberId));

      const [removed] = await tx
        .delete(members)
        .where(eq(members.id, memberId))
        .returning({ userId: members.userId });

      if (!removed) {
        return;
      }

      // Also erase the person's name and email (see /privacy), unless they
      // still belong to another subscription or own one.
      const stillMember = await tx.query.members.findFirst({
        where: eq(members.userId, removed.userId),
      });
      const isOwner = await tx.query.subscriptions.findFirst({
        where: eq(subscriptions.ownerId, removed.userId),
      });

      if (!stillMember && !isOwner) {
        await tx.delete(users).where(eq(users.id, removed.userId));
      }
    });

    revalidatePath("/dashboard");

    return {};
  } catch {
    return { error: "Member couldn't be removed. Try again." };
  }
}

export async function remindMember(
  memberId: number,
): Promise<{ error?: string }> {
  const denied = await guard();

  if (denied) {
    return denied;
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
