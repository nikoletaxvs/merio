import { NextRequest, NextResponse } from "next/server";
import { generatePayments } from "@/app/dashboard/payment-generation";
import { isAuthorizedCron } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generatePayments();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment generation failed:", error);

    return NextResponse.json(
      { error: "Payment generation failed" },
      { status: 500 },
    );
  }
}
