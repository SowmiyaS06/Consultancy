const User = require("../models/User");
const Order = require("../models/Order");

const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("name email createdAt").sort({ createdAt: -1 });
    const orderCounts = await Order.aggregate([
      { $match: { user: { $ne: null } } },
      { $group: { _id: "$user", totalOrders: { $sum: 1 } } },
    ]);
    const countMap = new Map(orderCounts.map((entry) => [String(entry._id), entry.totalOrders]));

    const payload = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      totalOrders: countMap.get(String(user._id)) || 0,
    }));

    return res.status(200).json({ users: payload });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listUsers };
