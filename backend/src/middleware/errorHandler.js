const { env } = require("../config/env");

function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  if (statusCode === 500 && req.method === "POST" && /^\/api\/auth\/login\/?$/i.test(req.path)) {
    console.error("[auth.login] unexpected_failure", {
      stage: res.locals.loginStage || "request_validation",
    });
  }

  if (statusCode >= 500 && req.method === "POST" && req.path === "/api/progress/library-activity") {
    console.error("[library.activity] write_failed", { name: error.name, statusCode });
  }

  const payload = {
    message: statusCode === 500 ? "Internal server error" : error.message,
  };

  if (error.errors && statusCode < 500) {
    payload.errors = error.errors;
  }

  if (env.NODE_ENV !== "production" && statusCode === 500) {
    payload.detail = error.message;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler, notFoundHandler };
