"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { OWNER_ID } from "@/lib/owner";
import { type ActionState, guard } from "./shared";

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
      .where(eq(subscriptions.ownerId, OWNER_ID));

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
      .where(eq(subscriptions.ownerId, OWNER_ID));

    revalidatePath("/dashboard");

    return null;
  } catch {
    return { error: "Settings couldn't be saved. Try again." };
  }
}
