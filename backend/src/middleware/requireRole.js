const { AppError } = require("../utils/AppError");

function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new AppError("Insufficient permissions", 403));
    }

    return next();
  };
}

module.exports = { requireRole };
