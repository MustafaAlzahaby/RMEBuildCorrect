const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signAuthToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id || user._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function signEmailVerificationToken(user) {
  return jwt.sign({ purpose: "email-verification" }, env.EMAIL_VERIFICATION_SECRET, {
    subject: user.id || user._id.toString(),
    expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN,
  });
}

function verifyEmailVerificationToken(token) {
  return jwt.verify(token, env.EMAIL_VERIFICATION_SECRET);
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = {
  authCookieOptions,
  signAuthToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
};
