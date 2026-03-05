const Product = require("../models/Product");
const Offer = require("../models/Offer");
const { withProductImage } = require("../utils/productImage");

const listProducts = async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    const normalized = products.map((product) => withProductImage(product.toObject()));
    return res.status(200).json({ products: normalized });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const listOffers = async (_req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .populate("products", "name price category image unit originalPrice stock inStock isActive")
      .sort({ createdAt: -1 });

    const normalized = offers.map((offer) => ({
      ...offer.toObject(),
      products: offer.products
        .filter((product) => product.isActive)
        .map((product) => withProductImage(product.toObject())),
    }));

    return res.status(200).json({ offers: normalized });
  } catch (_err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { listProducts, listOffers };
