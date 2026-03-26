const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { userAuth } = require("../middlewares/auth");
const { createOrder, listOrders } = require("../controllers/orderController");

const PAYMENT_METHODS = ["cod", "upi", "card", "netbanking"];
const PAYMENT_STATUSES = ["pending", "pending verification", "paid", "failed"];

const router = express.Router();

router.post(
  "/",
  userAuth,
  [
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("items.*.productId").isMongoId().withMessage("Valid product ID required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("paymentMethod")
      .isString()
      .trim()
      .toLowerCase()
      .isIn(PAYMENT_METHODS)
      .withMessage("Select a valid payment method"),
    body("paymentStatus")
      .optional()
      .isString()
      .trim()
      .toLowerCase()
      .isIn(PAYMENT_STATUSES)
      .withMessage("Select a valid payment status"),
    body("name").isString().trim().notEmpty().withMessage("Name required"),
    body("phone").isString().trim().notEmpty().withMessage("Phone required"),
    body("address").isString().trim().notEmpty().withMessage("Address required"),
    body("pincode").isString().trim().isLength({ min: 6, max: 6 }),
    body("notes").optional().isString().trim(),
  ],
  validate,
  createOrder,
);

router.get("/", userAuth, listOrders);

module.exports = router;
