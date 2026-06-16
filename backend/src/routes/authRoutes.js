const express = require("express");
const { body, query } = require("express-validator");
const {
  login,
  logout,
  me,
  register,
  verifyEmail,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register,
);

router.get(
  "/verify-email",
  [query("token").isString().notEmpty().withMessage("Token is required")],
  validate,
  verifyEmail,
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

router.post("/logout", logout);
router.get("/me", verifyToken, me);

module.exports = router;
