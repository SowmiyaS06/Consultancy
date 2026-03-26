const express = require("express");
const { body } = require("express-validator");
const { adminAuth } = require("../middlewares/adminAuth");
const { validate } = require("../middlewares/validate");
const { loginAdmin, getAdminProfile } = require("../controllers/adminAuthController");
const {
  createProduct,
  listProducts,
  updateProduct,
  toggleProductActive,
} = require("../controllers/adminProductController");
const {
  createOffer,
  listOffers,
  updateOffer,
  toggleOfferActive,
} = require("../controllers/adminOfferController");
const { getOrders, updateOrderStatus, updateOrderPaymentStatus } = require("../controllers/adminOrderController");
const { listUsers } = require("../controllers/adminUserController");
const { listPincodes, createPincode, updatePincode, togglePincode } = require("../controllers/adminPincodeController");
const { getAdminSummary, getAdminAnalytics } = require("../controllers/adminDashboardController");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginAdmin,
);

router.get("/me", adminAuth, getAdminProfile);
router.get("/summary", adminAuth, getAdminSummary);
router.get("/analytics", adminAuth, getAdminAnalytics);

router.get("/products", adminAuth, listProducts);

router.post(
  "/products",
  adminAuth,
  [
    body("name").isString().trim().notEmpty(),
    body("price").isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("image").optional().isString(),
    body("imageUrl").optional().isString(),
    body("category").optional().isString().trim(),
    body("unit").optional().isString().trim(),
  ],
  validate,
  createProduct,
);

router.put(
  "/products/:id",
  adminAuth,
  [
    body("name").optional().isString().trim(),
    body("price").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("image").optional().isString(),
    body("imageUrl").optional().isString(),
    body("category").optional().isString().trim(),
    body("unit").optional().isString().trim(),
    body("isActive").optional().isBoolean(),
  ],
  validate,
  updateProduct,
);

router.patch("/products/:id/toggle", adminAuth, toggleProductActive);

router.post(
  "/offers",
  adminAuth,
  [
    body("title").isString().trim().notEmpty(),
    body("bannerUrl").isString().trim().notEmpty(),
    body("products").optional().isArray(),
  ],
  validate,
  createOffer,
);

router.get("/offers", adminAuth, listOffers);

router.put(
  "/offers/:id",
  adminAuth,
  [
    body("title").optional().isString().trim(),
    body("bannerUrl").optional().isString().trim(),
    body("products").optional().isArray(),
    body("isActive").optional().isBoolean(),
  ],
  validate,
  updateOffer,
);

router.patch("/offers/:id/toggle", adminAuth, toggleOfferActive);

router.get("/orders", adminAuth, getOrders);

router.get("/users", adminAuth, listUsers);

router.patch(
  "/orders/:id/status",
  adminAuth,
  [body("status").isIn(["placed", "delivered", "cancelled"])],
  validate,
  updateOrderStatus,
);

router.patch(
  "/orders/:id/payment-status",
  adminAuth,
  [body("paymentStatus").isIn(["pending", "pending verification", "paid", "failed"])],
  validate,
  updateOrderPaymentStatus,
);

router.get("/pincodes", adminAuth, listPincodes);

router.post(
  "/pincodes",
  adminAuth,
  [body("code").isString().isLength({ min: 6, max: 6 })],
  validate,
  createPincode,
);

router.put(
  "/pincodes/:id",
  adminAuth,
  [
    body("code").optional().isString().isLength({ min: 6, max: 6 }),
    body("isServiceable").optional().isBoolean(),
  ],
  validate,
  updatePincode,
);

router.patch("/pincodes/:id/toggle", adminAuth, togglePincode);

module.exports = router;
