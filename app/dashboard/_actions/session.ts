"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession } from "@/lib/auth";
import { isDemoMode, resetDemoData } from "@/lib/demo";
import { guard } from "./shared";

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}

export async function resetDemo(): Promise<void> {
  if ((await guard()) || !isDemoMode()) {
    redirect("/login");
  }

  await resetDemoData();
  revalidatePath("/dashboard");
}
