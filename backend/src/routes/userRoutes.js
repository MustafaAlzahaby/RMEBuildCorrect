const express = require("express");
const { body, param } = require("express-validator");
const { deleteUser, listUsers, updateUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/requireRole");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(verifyToken, requireRole("admin"));

router.get("/", listUsers);
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
