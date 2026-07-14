const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { isCompanyEmail, normalizeEmail } = require("../utils/normalizeEmail");
const {
  authCookieOptions,
  signAuthToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} = require("../utils/jwt");
const { sendVerificationEmail } = require("../services/emailService");

const RESEND_MESSAGE =
  "If an unverified account exists for that email, a new verification link has been sent.";

async function deliverVerificationEmail(user) {
  const verificationToken = signEmailVerificationToken(user);
  await sendVerificationEmail(user, verificationToken);
}

const register = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!isCompanyEmail(email)) {
    throw new AppError("Email must end with @rowad-rme.com", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(
      existing.isVerified
        ? "An account with this email already exists"
        : "This account is waiting for email verification. Sign in to request a new link.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
    isVerified: false,
    emailVerificationSentAt: new Date(),
  });

  try {
    await deliverVerificationEmail(user);
  } catch (error) {
    await User.deleteOne({ _id: user._id, isVerified: false });
    console.error("Failed to send registration verification email", error);
    throw new AppError("We could not send the verification email. Please try again shortly.", 503);
  }

  res.status(201).json({
    message: "Registration successful. Please check your email to verify your account.",
    user,
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  let decoded;
  try {
    decoded = verifyEmailVerificationToken(token);
  } catch (_error) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  if (decoded.purpose !== "email-verification") {
    throw new AppError("Invalid verification token", 400);
  }

  const user = await User.findById(decoded.sub).select("+emailVerificationVersion");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    return res.json({ message: "Email already verified", user });
  }

  if (
    decoded.email !== user.email ||
    decoded.version !== user.emailVerificationVersion
  ) {
    throw new AppError("This verification link is no longer valid. Request a new one.", 400);
  }

  user.isVerified = true;
  user.emailVerificationVersion += 1;
  user.emailVerificationSentAt = null;
  await user.save();

  res.json({ message: "Email verified successfully", user });
});

const resendVerification = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!isCompanyEmail(email)) {
    throw new AppError("Use your @rowad-rme.com work email", 400);
  }

  const user = await User.findOne({ email }).select(
    "+emailVerificationVersion +emailVerificationSentAt",
  );

  if (!user || user.isVerified) {
    return res.json({ message: RESEND_MESSAGE });
  }

  const cooldownMs = env.EMAIL_RESEND_COOLDOWN_SECONDS * 1000;
  const elapsedMs = user.emailVerificationSentAt
    ? Date.now() - user.emailVerificationSentAt.getTime()
    : cooldownMs;

  if (elapsedMs < cooldownMs) {
    return res.json({
      message: RESEND_MESSAGE,
      retryAfterSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000),
    });
  }

  user.emailVerificationVersion += 1;
  user.emailVerificationSentAt = new Date();
  await user.save();

  try {
    await deliverVerificationEmail(user);
  } catch (error) {
    user.emailVerificationSentAt = null;
    await user.save();
    console.error("Failed to resend verification email", error);
    throw new AppError("We could not send the verification email. Please try again shortly.", 503);
  }

  res.json({ message: RESEND_MESSAGE });
});

const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!isCompanyEmail(email)) {
    throw new AppError("Email must end with @rowad-rme.com", 400);
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  const token = signAuthToken(user);
  res.cookie(env.JWT_COOKIE_NAME, token, authCookieOptions());
  res.json({ message: "Logged in successfully", user });
});

const logout = (_req, res) => {
  res.clearCookie(env.JWT_COOKIE_NAME, authCookieOptions());
  res.json({ message: "Logged out successfully" });
};

const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, logout, me, register, resendVerification, verifyEmail };
