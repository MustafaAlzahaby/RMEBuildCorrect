const { validationResult } = require("express-validator");
const { AppError } = require("../utils/AppError");

function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const error = new AppError("Validation failed", 400);
  error.errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));
  return next(error);
}

module.exports = { validate };
