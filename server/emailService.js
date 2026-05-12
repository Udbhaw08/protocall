import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    throw new Error("Server misconfigured: missing RESEND_API_KEY");
  }

  return resend.emails.send({
    from: process.env.FROM_EMAIL || "Protocall <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};
