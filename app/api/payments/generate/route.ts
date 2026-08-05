import { NextRequest, NextResponse } from "next/server";

import { generatePayments } from "@/app/dashboard/payment-generation";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generatePayments();

  return NextResponse.json(result);
}
