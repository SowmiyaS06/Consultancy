const Product = require("../models/Product");
const { getDynamicProductImage, withProductImage } = require("../utils/productImage");

const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.imageUrl && !payload.image) {
      payload.image = payload.imageUrl;
    }
    payload.image = getDynamicProductImage(payload.name, payload.image);
    const product = await Product.create(payload);
    return res.status(201).json({ product: withProductImage(product.toObject()) });
  } catch (err) {
    return next(err);
  }
};

const listProducts = async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const normalized = products.map((product) => withProductImage(product.toObject()));
    return res.status(200).json({ products: normalized });
  } catch (err) {
    return next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.imageUrl && !updates.image) {
      updates.image = updates.imageUrl;
    }
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const nextName = typeof updates.name === "string" ? updates.name : existing.name;
    updates.image = getDynamicProductImage(nextName, updates.image || existing.image);

    if (typeof updates.stock === "number") {
      updates.inStock = updates.stock > 0;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ product: withProductImage(product.toObject()) });
  } catch (err) {
    return next(err);
  }
};

const toggleProductActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.isActive = !product.isActive;
    await product.save();
    return res.status(200).json({ product: withProductImage(product.toObject()) });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createProduct, listProducts, updateProduct, toggleProductActive };
