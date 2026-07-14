const express = require("express");
const { param } = require("express-validator");
const {
  getProgress,
  recordView,
} = require("../controllers/progressController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken);

router.get("/", getProgress);
router.post(
  "/:lessonId",
  [param("lessonId").isMongoId().withMessage("Valid guide id is required")],
  validate,
  recordView,
);

module.exports = router;
