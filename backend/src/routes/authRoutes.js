const express = require("express");
const { body, query } = require("express-validator");
const {
  login,
  logout,
  me,
  register,
  resendVerification,
  verifyEmail,
} = require("../controllers/authController");
const { optionalAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Full name must be between 2 and 100 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .bail()
      .custom((value) => value.toLowerCase().split("@")[1] === "rowad-rme.com")
      .withMessage("Use your @rowad-rme.com work email"),
    body("password")
      .isLength({ min: 10, max: 128 })
      .withMessage("Password must be between 10 and 128 characters")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must include a number"),
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
  "/resend-verification",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .bail()
      .custom((value) => value.toLowerCase().split("@")[1] === "rowad-rme.com")
      .withMessage("Use your @rowad-rme.com work email"),
  ],
  validate,
  resendVerification,
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
router.get("/me", optionalAuth, me);

module.exports = router;
