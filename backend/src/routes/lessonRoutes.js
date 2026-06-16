const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createLesson,
  deleteLesson,
  getLesson,
  listLessons,
  updateLesson,
} = require("../controllers/lessonController");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const { handleUploadError, upload } = require("../middleware/upload");
const { validate } = require("../middleware/validate");

const router = express.Router();
const adminOnly = [verifyToken, requireRole("admin")];
const lessonUpload = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "images", maxCount: 20 },
]);

router.get(
  "/",
  [query("category").optional().trim().notEmpty().withMessage("Category filter cannot be empty")],
  validate,
  listLessons,
);

router.get(
  "/:slug",
  [param("slug").trim().notEmpty().withMessage("Slug is required")],
  validate,
  getLesson,
);

router.post(
  "/",
  adminOnly,
  lessonUpload,
  handleUploadError,
  [
    body("title").trim().isLength({ min: 2 }).withMessage("Title is required"),
    body("slug").optional().trim().isLength({ min: 2 }).withMessage("Slug is too short"),
    body("categoryId").isMongoId().withMessage("Valid category id is required"),
    body("description").optional().isString(),
    body("instructions").optional().isString(),
    body("bestPractices").optional().isString(),
    body("methodStatement").optional().isString(),
  ],
  validate,
  createLesson,
);

router.put(
  "/:id",
  adminOnly,
  lessonUpload,
  handleUploadError,
  [
    param("id").isMongoId().withMessage("Valid lesson id is required"),
    body("title").optional().trim().isLength({ min: 2 }).withMessage("Title is too short"),
    body("slug").optional().trim().isLength({ min: 2 }).withMessage("Slug is too short"),
    body("categoryId").optional().isMongoId().withMessage("Valid category id is required"),
    body("description").optional().isString(),
    body("instructions").optional().isString(),
    body("bestPractices").optional().isString(),
    body("methodStatement").optional().isString(),
  ],
  validate,
  updateLesson,
);

router.delete(
  "/:id",
  adminOnly,
  [param("id").isMongoId().withMessage("Valid lesson id is required")],
  validate,
  deleteLesson,
);

module.exports = router;
