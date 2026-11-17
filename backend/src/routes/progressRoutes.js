const express = require("express");
const { body, param } = require("express-validator");
const {
  getProgress,
  recordView,
  completeGuide,
} = require("../controllers/progressController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const { recordLibraryActivity } = require("../controllers/libraryActivityController");
const LibraryActivity = require("../models/LibraryActivity");

const router = express.Router();

router.use(verifyToken);

router.get("/", getProgress);
router.post(
  "/library-activity",
  [
    body("kind").isIn(LibraryActivity.schema.path("kind").enumValues),
    body("title").isString().bail().trim().isLength({ min: 1, max: 300 }),
    body("context").optional().isString().bail().trim().isLength({ max: 600 }),
  ],
  validate,
  recordLibraryActivity,
);
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
