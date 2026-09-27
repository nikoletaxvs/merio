import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendPeriodStartReminders } from "@/app/dashboard/period-reminders";
import { parseDate, toDateString } from "@/lib/periods";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = await getBaseUrl();
    // Optional ?date=YYYY-MM-DD pretends "today" is that day, for testing
    // the reminder cadence without waiting. Reminders only depend on the
    // date, never the time of day.
    const dateParam = request.nextUrl.searchParams.get("date");
    let today: Date | undefined;

    if (dateParam) {
      today = parseDate(dateParam);
      if (toDateString(today) !== dateParam) {
        return NextResponse.json(
          { error: "Invalid date, expected YYYY-MM-DD" },
          { status: 400 },
        );
      }
    }

    const result = await sendPeriodStartReminders(baseUrl, today);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Period reminders failed:", error);

    return NextResponse.json(
      { error: "Period reminders failed" },
      { status: 500 },
    );
  }
}
