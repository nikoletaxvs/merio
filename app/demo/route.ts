import { redirect } from "next/navigation";

import { startSession } from "@/lib/auth";
import { ensureDemoData, isDemoMode } from "@/lib/demo";

// Demo entry point: signs the visitor in and drops them on the dashboard,
// so a link to the demo needs no extra click. A GET that sets a session is
// only acceptable because the demo has nothing to protect.
export async function GET() {
  if (!isDemoMode()) {
    redirect("/login");
  }

  await ensureDemoData();
  await startSession();
  redirect("/dashboard");
}
