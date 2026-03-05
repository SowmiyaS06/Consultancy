const Offer = require("../models/Offer");
const { withProductImage } = require("../utils/productImage");

const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    return res.status(201).json({ offer });
  } catch (err) {
    return next(err);
  }
};

const listOffers = async (_req, res, next) => {
  try {
    const offers = await Offer.find().populate("products", "name price image").sort({ createdAt: -1 });
    const normalized = offers.map((offer) => ({
      ...offer.toObject(),
      products: offer.products.map((product) => withProductImage(product.toObject())),
    }));
    return res.status(200).json({ offers: normalized });
  } catch (err) {
    return next(err);
  }
};

const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    return res.status(200).json({ offer });
  } catch (err) {
    return next(err);
  }
};

const toggleOfferActive = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    offer.isActive = !offer.isActive;
    await offer.save();
    return res.status(200).json({ offer });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createOffer, listOffers, updateOffer, toggleOfferActive };
