import { NextRequest, NextResponse } from "next/server";
import { generatePayments } from "@/app/dashboard/payment-generation";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
