function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: statusCode === 500 ? "Internal server error" : error.message,
  };

  if (error.errors) {
    payload.errors = error.errors;
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    payload.detail = error.message;
  }

  res.status(statusCode).json(payload);
}

module.exports = { errorHandler, notFoundHandler };
