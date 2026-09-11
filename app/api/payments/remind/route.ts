import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/base-url";
import { sendPeriodStartReminders } from "@/app/dashboard/period-reminders";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const baseUrl = await getBaseUrl();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const hourParam = searchParams.get("hour");

    if (dateParam && hourParam) {
      return NextResponse.json(
        { error: "Use either date or hour, not both" },
        { status: 400 },
      );
    }

    let today: Date | undefined;

    if (dateParam) {
      today = new Date(dateParam);
    } else if (hourParam) {
      const hour = Number(hourParam);
      if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        return NextResponse.json(
          { error: "Invalid hour, expected 0-23" },
          { status: 400 },
        );
      }
      today = new Date();
      today.setHours(hour, 0, 0, 0);
    }

    if (today && isNaN(today.getTime())) {
      return NextResponse.json(
        { error: "Invalid date, expected YYYY-MM-DD" },
        { status: 400 },
      );
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
