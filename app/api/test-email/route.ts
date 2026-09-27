import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipient = process.env.GMAIL_USER;

  if (!recipient) {
    return NextResponse.json(
      { success: false, error: "GMAIL_USER is not set" },
      { status: 500 },
    );
  }

  try {
    // Sends to the app's own Gmail account, so this can only ever email the owner.
    await sendEmail({
      to: { email: recipient, name: "Merio" },
      subject: "Merio test",
      html: ` <h2>It works! </h2>

      <p>This is a test email from your Merio app.</p>

      <p>
        Gmail is successfully connected to your Next.js application.
      </p>
    `,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Email request failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email",
      },
      { status: 500 },
    );
  }
}
