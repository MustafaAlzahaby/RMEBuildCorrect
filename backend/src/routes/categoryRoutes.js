const express = require("express");
const { body, param } = require("express-validator");
const {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const { validate } = require("../middleware/validate");

const router = express.Router();
const adminOnly = [verifyToken, requireRole("admin")];

router.get("/", verifyToken, listCategories);
router.get(
  "/:slug",
  verifyToken,
  [param("slug").trim().notEmpty().withMessage("Slug is required")],
  validate,
  getCategory,
);

router.post(
  "/",
  adminOnly,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("slug").optional().trim().isLength({ min: 2 }).withMessage("Slug is too short"),
    body("code").optional().isString(),
    body("parentId").optional({ values: "falsy" }).isMongoId().withMessage("Valid parent id is required"),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isString(),
  ],
  validate,
  createCategory,
);

router.put(
  "/:id",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Valid category id is required"),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name is too short"),
    body("slug").optional().trim().isLength({ min: 2 }).withMessage("Slug is too short"),
    body("code").optional().isString(),
    body("parentId").optional({ values: "falsy" }).isMongoId().withMessage("Valid parent id is required"),
    body("description").optional().isString(),
    body("thumbnailUrl").optional().isString(),
  ],
  validate,
  updateCategory,
);

router.delete(
  "/:id",
  adminOnly,
  [param("id").isMongoId().withMessage("Valid category id is required")],
  validate,
  deleteCategory,
);

module.exports = router;
