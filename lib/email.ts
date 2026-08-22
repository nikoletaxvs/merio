import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}) {
  const user = process.env.GMAIL_USER;

  await getTransporter().sendMail({
    from: `"Merio" <${user}>`,
    to: to.name ? `"${to.name}" <${to.email}>` : to.email,
    subject,
    html,
  });
}
