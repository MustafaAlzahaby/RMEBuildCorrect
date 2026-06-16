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

const register = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!isCompanyEmail(email)) {
    throw new AppError("Email must end with @rowad-rme.com", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
    isVerified: false,
  });

  const verificationToken = signEmailVerificationToken(user);
  await sendVerificationEmail(user, verificationToken);

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

  const user = await User.findByIdAndUpdate(
    decoded.sub,
    { isVerified: true },
    { new: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ message: "Email verified successfully", user });
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

module.exports = { login, logout, me, register, verifyEmail };
