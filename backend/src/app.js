const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const { env } = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
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

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
