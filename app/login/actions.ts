"use server";

import { redirect } from "next/navigation";

import { startSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-tokens";

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
