const express = require("express");
const { param } = require("express-validator");
const {
  getProgress,
  recordView,
  completeGuide,
} = require("../controllers/progressController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken);

router.get("/", getProgress);
router.put(
  "/:lessonId/completion",
  [param("lessonId").isMongoId().withMessage("Valid guide id is required")],
  validate,
  completeGuide,
);
router.post(
  "/:lessonId",
  [param("lessonId").isMongoId().withMessage("Valid guide id is required")],
  validate,
  recordView,
);

module.exports = router;
