"use server";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { members, subscriptions, users } from "@/db/schema";

export async function createSubscription(formData: FormData) {
  const name = formData.get("name");
  const amountCents = formData.get("amountCents");
  const generationDay = formData.get("generationDay");
  const dueDay = formData.get("dueDay");

  if (
    typeof name !== "string" ||
    typeof amountCents !== "string" ||
    typeof generationDay !== "string" ||
    typeof dueDay !== "string"
  ) {
    throw new Error("Invalid form data");
  }

  await db.insert(subscriptions).values({
    ownerId: 1,
    name,
    amountCents: Number(amountCents),
    generationDay: Number(generationDay),
    dueDay: Number(dueDay),
  });
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
