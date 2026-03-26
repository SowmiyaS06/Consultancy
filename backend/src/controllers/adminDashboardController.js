const Product = require("../models/Product");
const Offer = require("../models/Offer");
const Order = require("../models/Order");
const User = require("../models/User");

const asNumber = (value) => (typeof value === "number" ? value : 0);

const getDateKeyUtc = (date) => date.toISOString().slice(0, 10);

const getAdminAnalytics = async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfTodayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const sevenDayStartUtc = new Date(startOfTodayUtc);
    sevenDayStartUtc.setUTCDate(sevenDayStartUtc.getUTCDate() - 6);
    const startOfMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [orderAnalytics] = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$total" },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          todayRevenue: [
            { $match: { createdAt: { $gte: startOfTodayUtc } } },
            { $group: { _id: null, revenue: { $sum: "$total" } } },
          ],
          weeklyRevenue: [
            { $match: { createdAt: { $gte: sevenDayStartUtc } } },
            { $group: { _id: null, revenue: { $sum: "$total" } } },
          ],
          monthlyRevenue: [
            { $match: { createdAt: { $gte: startOfMonthUtc } } },
            { $group: { _id: null, revenue: { $sum: "$total" } } },
          ],
          dailySales: [
            { $match: { createdAt: { $gte: sevenDayStartUtc } } },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "UTC",
                  },
                },
                revenue: { $sum: "$total" },
              },
            },
            { $sort: { _id: 1 } },
          ],
          topProducts: [
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.product",
                totalQuantitySold: { $sum: "$items.quantity" },
                totalRevenueGenerated: {
                  $sum: { $multiply: ["$items.quantity", "$items.price"] },
                },
              },
            },
            { $sort: { totalQuantitySold: -1, totalRevenueGenerated: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                productId: {
                  $cond: [
                    { $ifNull: ["$_id", false] },
                    { $toString: "$_id" },
                    "unknown",
                  ],
                },
                productName: { $ifNull: ["$product.name", "Unknown Product"] },
                totalQuantitySold: 1,
                totalRevenueGenerated: 1,
              },
            },
          ],
        },
      },
    ]);

    const [inventoryAnalytics] = await Product.aggregate([
      {
        $facet: {
          stockSummary: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                inStockProducts: {
                  $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] },
                },
                outOfStockProducts: {
                  $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
                },
              },
            },
          ],
          lowStockProducts: [
            { $match: { stock: { $lte: 5 } } },
            {
              $project: {
                _id: 0,
                productId: { $toString: "$_id" },
                productName: "$name",
                currentStock: { $ifNull: ["$stock", 0] },
              },
            },
            { $sort: { currentStock: 1, productName: 1 } },
          ],
        },
      },
    ]);

    const totals = orderAnalytics?.totals?.[0] || {};
    const todayRevenueDoc = orderAnalytics?.todayRevenue?.[0] || {};
    const weeklyRevenueDoc = orderAnalytics?.weeklyRevenue?.[0] || {};
    const monthlyRevenueDoc = orderAnalytics?.monthlyRevenue?.[0] || {};
    const topProducts = orderAnalytics?.topProducts || [];

    const dailySalesRevenueMap = new Map(
      (orderAnalytics?.dailySales || []).map((entry) => [entry._id, asNumber(entry.revenue)]),
    );

    const dailySales = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDayStartUtc);
      date.setUTCDate(sevenDayStartUtc.getUTCDate() + index);

      const dateKey = getDateKeyUtc(date);
      const dayLabel = date.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });

      return {
        date: dayLabel,
        revenue: dailySalesRevenueMap.get(dateKey) || 0,
      };
    });

    const stockSummary = inventoryAnalytics?.stockSummary?.[0] || {};
    const lowStockProducts = inventoryAnalytics?.lowStockProducts || [];

    return res.status(200).json({
      totalRevenue: asNumber(totals.totalRevenue),
      todayRevenue: asNumber(todayRevenueDoc.revenue),
      weeklyRevenue: asNumber(weeklyRevenueDoc.revenue),
      monthlyRevenue: asNumber(monthlyRevenueDoc.revenue),
      totalOrders: asNumber(totals.totalOrders),
      totalProducts: asNumber(stockSummary.totalProducts),
      inStockProducts: asNumber(stockSummary.inStockProducts),
      outOfStockProducts: asNumber(stockSummary.outOfStockProducts),
      topProducts,
      lowStockProducts,
      dailySales,
    });
  } catch (err) {
    return next(err);
  }
};

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

module.exports = { getAdminSummary, getAdminAnalytics };
