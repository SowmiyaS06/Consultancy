const express = require("express");
const healthRoutes = require("./health");
const adminRoutes = require("./admin");
const authRoutes = require("./auth");
const storeRoutes = require("./store");
const orderRoutes = require("./orders");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/store", storeRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
