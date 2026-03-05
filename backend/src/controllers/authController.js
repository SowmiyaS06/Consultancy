const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
};

const mapUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
  cart: user.cart || [],
  orders: user.orders || [],
});

const register = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      passwordHash: hashedPassword,
      cart: [],
      orders: [],
    });
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: mapUser(user),
    });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const signup = register;

const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not have an account" });
    }

    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.status(200).json({
      token,
      user: mapUser(user),
    });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("name email phone createdAt cart orders")
      .populate("orders", "status total createdAt")
      .populate("cart.product", "name price image");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: mapUser(user) });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, signup, login, getProfile };
