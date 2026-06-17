const dotenv = require("dotenv");

dotenv.config();

const baseRequired = [
  "MONGODB_URI",
  "FRONTEND_ORIGIN",
  "API_BASE_URL",
  "JWT_SECRET",
  "EMAIL_VERIFICATION_SECRET",
  "EMAIL_FROM",
];

const emailDelivery = process.env.EMAIL_DELIVERY || "log";
const required = [...baseRequired];

if (emailDelivery === "smtp") {
  required.push("SMTP_HOST", "SMTP_USER", "SMTP_PASS");
}

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  API_BASE_URL: process.env.API_BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "academy_token",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_EXPIRES_IN: process.env.EMAIL_VERIFICATION_EXPIRES_IN || "1d",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  S3_SIGNED_URL_EXPIRES_SECONDS: Number(process.env.S3_SIGNED_URL_EXPIRES_SECONDS || 3600),
  EMAIL_DELIVERY: emailDelivery,
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM,
};

module.exports = { env };
