const express = require("express");
const { body, param, query } = require("express-validator");
const { deleteUser, getUserActivity, listUsers, updateUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

router.get("/", listUsers);
router.get(
  "/:id/activity",
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    query("page").optional().isInt({ min: 1, max: 10000 }).withMessage("Invalid page"),
  ],
  validate,
  getUserActivity,
);
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Role must be user or admin"),
    body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  ],
  validate,
  updateUser,
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Valid user id is required")],
  validate,
  deleteUser,
);

module.exports = router;
