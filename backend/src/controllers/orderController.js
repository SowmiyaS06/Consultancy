const Order = require("../models/Order");
const Product = require("../models/Product");
const Pincode = require("../models/Pincode");
const User = require("../models/User");
const { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } = require("../config/commerce");

const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, name, phone, address, pincode, notes } = req.body;
    const productIds = items.map((item) => item.productId);

    const serviceable = await Pincode.findOne({ code: pincode, isServiceable: true });
    if (!serviceable) {
      return res.status(400).json({ message: "Delivery not available for this pincode" });
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ message: "One or more products are unavailable" });
      }
      if (!product.inStock || product.stock <= 0 || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      subtotal += product.price * item.quantity;
    }

    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const total = subtotal + deliveryCharge;

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
      customerName: name,
      phone,
      address,
      pincode,
      notes,
    });

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { orders: order._id } },
    );

    for (const item of orderItems) {
      const product = productMap.get(item.product.toString());
      const nextStock = product.stock - item.quantity;
      await Product.updateOne(
        { _id: product._id },
        { $set: { stock: nextStock, inStock: nextStock > 0 } },
      );
    }

    return res.status(201).json({ order });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createOrder, listOrders };
