import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail({
      to: { email: "nikoletaxvs@gmail.com", name: "Niko" },
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
