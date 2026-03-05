const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { userAuth } = require("../middlewares/auth");
const { register, signup, login, getProfile } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").isString().trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register,
);

router.post(
  "/signup",
  [
    body("name").isString().trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  signup,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  login,
);

router.get("/profile", userAuth, getProfile);
router.get("/me", userAuth, getProfile);

module.exports = router;
