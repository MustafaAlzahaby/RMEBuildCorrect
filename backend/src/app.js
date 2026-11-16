const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const { env } = require("./config/env");
const { connectDb, checkDbReady } = require("./config/db");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { asyncHandler } = require("./utils/asyncHandler");
const { AppError } = require("./utils/AppError");

const app = express();

app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.FILE_STORAGE === "local") {
  app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
}

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    await checkDbReady();
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

const awaitDatabase = asyncHandler(async (_req, _res, next) => {
  try {
    await connectDb();
  } catch {
    throw new AppError("Service temporarily unavailable", 503);
  }
  next();
});

app.use("/api", awaitDatabase, routes);

if (env.NODE_ENV === "production" && !env.IS_VERCEL_DEPLOYMENT) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist, { index: false }));
  app.get(
    ["/", "/login", "/register", "/verify-email", "/dashboard", "/admin", "/library", "/library/*", "/lessons/:id"],
    (_req, res, next) => {
      res.sendFile(path.join(frontendDist, "index.html"), (error) => {
        if (error?.code === "ENOENT") return next();
        if (error) return next(error);
      });
    },
  );
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
