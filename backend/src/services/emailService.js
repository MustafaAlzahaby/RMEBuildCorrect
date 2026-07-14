const nodemailer = require("nodemailer");
const { env } = require("../config/env");

const transporter =
  env.EMAIL_DELIVERY === "smtp"
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

async function sendVerificationEmail(user, token) {
  const verificationUrl = `${env.FRONTEND_ORIGIN.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;

  if (!transporter) {
    console.log(`Email delivery is disabled. Verification link for ${user.email}: ${verificationUrl}`);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject: "Verify your Rowad Field Guide account",
    text: `Hello ${user.name},\n\nVerify your Rowad Field Guide account by opening this secure link:\n${verificationUrl}\n\nThis link expires in ${env.EMAIL_VERIFICATION_EXPIRES_IN}. If you did not request this account, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#202124">
        <h2 style="margin-bottom:8px">Verify your work email</h2>
        <p>Hello ${escapeHtml(user.name)},</p>
        <p>Confirm your <strong>@rowad-rme.com</strong> address to activate your Rowad Field Guide account.</p>
        <p style="margin:28px 0">
          <a href="${verificationUrl}" style="background:#b91c1c;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">Verify email address</a>
        </p>
        <p style="font-size:13px;color:#5f6368">This secure link expires in ${escapeHtml(env.EMAIL_VERIFICATION_EXPIRES_IN)} and can only be used for your account.</p>
        <p style="font-size:13px;color:#5f6368">If you did not request this account, ignore this email.</p>
      </div>
    `,
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function verifyEmailTransport() {
  if (!transporter) {
    throw new Error('Set EMAIL_DELIVERY="smtp" before checking the email connection.');
  }
  await transporter.verify();
}

module.exports = { sendVerificationEmail, verifyEmailTransport };
