const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { userAuth } = require("../middlewares/auth");
const { createOrder, listOrders } = require("../controllers/orderController");

const router = express.Router();

router.post(
  "/",
  userAuth,
  [
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("items.*.productId").isMongoId().withMessage("Valid product ID required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("paymentMethod").isString().trim().notEmpty().withMessage("Payment method required"),
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
