import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedCron } from "@/lib/cron-auth";
import { isDemoMode, resetDemoData } from "@/lib/demo";

// Nightly cron. vercel.json schedules it on every deployment, so on the real
// (non-demo) deployment it answers 404 and touches nothing.
export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await resetDemoData();

    return NextResponse.json({ reset: true });
  } catch (error) {
    console.error("Demo reset failed:", error);

    return NextResponse.json({ error: "Demo reset failed" }, { status: 500 });
  }
}
