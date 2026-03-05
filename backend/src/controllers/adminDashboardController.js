const Product = require("../models/Product");
const Offer = require("../models/Offer");
const Order = require("../models/Order");
const User = require("../models/User");

const getAdminSummary = async (_req, res, next) => {
  try {
    const [totalProducts, totalUsers, activeOffers, totalOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Offer.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ]);

    return res.status(200).json({
      summary: { totalProducts, totalUsers, activeOffers, totalOrders },
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAdminSummary };
