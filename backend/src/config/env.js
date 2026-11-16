const dotenv = require("dotenv");

const isVercelDeployment = process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "development";

if (!isVercelDeployment) {
  dotenv.config();
}

const baseRequired = [
  "MONGODB_URI",
  "FRONTEND_ORIGIN",
  "API_BASE_URL",
  "JWT_SECRET",
  "EMAIL_VERIFICATION_SECRET",
  "EMAIL_FROM",
];

const emailDelivery = process.env.EMAIL_DELIVERY || "log";
const fileStorage = process.env.FILE_STORAGE || "s3";
const required = [...baseRequired];

if (emailDelivery === "smtp") {
  required.push("SMTP_HOST", "SMTP_USER", "SMTP_PASS");
}

if (!["local", "s3"].includes(fileStorage)) {
  throw new Error("FILE_STORAGE must be either local or s3");
}

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

function parseOrigin(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must contain valid HTTP or HTTPS origins`);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.hostname.includes("*")
  ) {
    throw new Error(`${name} must contain valid HTTP or HTTPS origins`);
  }

  return url.origin;
}

const frontendOrigin = parseOrigin(process.env.FRONTEND_ORIGIN, "FRONTEND_ORIGIN");
const apiBaseUrl = parseOrigin(process.env.API_BASE_URL, "API_BASE_URL");
const additionalOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => parseOrigin(origin, "CORS_ALLOWED_ORIGINS"));

if (isVercelDeployment && fileStorage === "local") {
  throw new Error("FILE_STORAGE=local is unavailable on Vercel. Configure S3 storage.");
}

if (isVercelDeployment && [frontendOrigin, apiBaseUrl].some((origin) => {
  const url = new URL(origin);
  return url.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
})) {
  throw new Error("FRONTEND_ORIGIN and API_BASE_URL must use deployed HTTPS origins on Vercel");
}

const env = {
  NODE_ENV: isVercelDeployment ? "production" : process.env.NODE_ENV || "development",
  IS_VERCEL_DEPLOYMENT: isVercelDeployment,
  PORT: Number(process.env.PORT || 5000),
  MONGODB_URI: process.env.MONGODB_URI,
  FRONTEND_ORIGIN: frontendOrigin,
  CORS_ALLOWED_ORIGINS: [frontendOrigin, ...additionalOrigins],
  API_BASE_URL: apiBaseUrl,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "academy_token",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET,
  EMAIL_VERIFICATION_EXPIRES_IN: process.env.EMAIL_VERIFICATION_EXPIRES_IN || "1d",
  EMAIL_RESEND_COOLDOWN_SECONDS: Number(process.env.EMAIL_RESEND_COOLDOWN_SECONDS || 60),
  FILE_STORAGE: fileStorage,
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
