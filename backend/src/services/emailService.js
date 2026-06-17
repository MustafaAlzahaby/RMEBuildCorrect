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
    subject: "Verify your Rowad Academy account",
    text: `Welcome ${user.name}. Verify your account here: ${verificationUrl}`,
    html: `
      <p>Welcome ${user.name},</p>
      <p>Please verify your Rowad Academy account by opening this link:</p>
      <p><a href="${verificationUrl}">Verify email</a></p>
    `,
  });
}

module.exports = { sendVerificationEmail };
