const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { authCookieOptions } = require("../utils/jwt");

const verifyToken = asyncHandler(async (req, _res, next) => {
  const token = req.cookies[env.JWT_COOKIE_NAME];

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (_error) {
    throw new AppError("Invalid or expired session", 401);
  }

  const user = await User.findById(decoded.sub).select("-passwordHash");
  if (!user || !user.isActive) {
    throw new AppError("User account is unavailable", 401);
  }

  req.user = user;
  next();
});

// Session discovery allows guests; protected routes continue to use verifyToken.
const optionalAuth = (req, res, next) => verifyToken(req, res, (error) => {
  if (error?.statusCode === 401) {
    if (req.cookies[env.JWT_COOKIE_NAME]) {
      res.clearCookie(env.JWT_COOKIE_NAME, authCookieOptions());
    }
    req.user = null;
    return next();
  }
  return next(error);
});

module.exports = { verifyToken, optionalAuth };
