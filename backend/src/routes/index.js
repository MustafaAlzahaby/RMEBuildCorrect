const express = require("express");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const lessonRoutes = require("./lessonRoutes");
const progressRoutes = require("./progressRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/lessons", lessonRoutes);
router.use("/progress", progressRoutes);
router.use("/users", userRoutes);

module.exports = router;
