const express = require("express");
const { param } = require("express-validator");
const {
  getProgress,
  markComplete,
  unmarkComplete,
} = require("../controllers/progressController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken);

router.get("/", getProgress);
router.post(
  "/:lessonId",
  [param("lessonId").isMongoId().withMessage("Valid lesson id is required")],
  validate,
  markComplete,
);
router.delete(
  "/:lessonId",
  [param("lessonId").isMongoId().withMessage("Valid lesson id is required")],
  validate,
  unmarkComplete,
);

module.exports = router;
