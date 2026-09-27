"use server";

import { redirect } from "next/navigation";

import { startSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-tokens";
import { ensureDemoData, isDemoMode } from "@/lib/demo";

export type LoginState = { error: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");

  if (typeof password !== "string" || password === "") {
    return { error: "Enter your password." };
  }

  if (!(await verifyPassword(password))) {
    return { error: "Wrong password. Try again." };
  }

  await startSession();
  redirect("/dashboard");
}

export async function enterDemo(): Promise<void> {
  // Server actions are public endpoints; without this check anyone could
  // POST to this action on the real deployment and skip the password.
  if (!isDemoMode()) {
    redirect("/login");
  }

  await ensureDemoData();
  await startSession();
  redirect("/dashboard");
}
