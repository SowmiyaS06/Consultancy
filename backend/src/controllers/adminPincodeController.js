const Pincode = require("../models/Pincode");

const listPincodes = async (_req, res, next) => {
  try {
    const pincodes = await Pincode.find().sort({ code: 1 });
    return res.status(200).json({ pincodes });
  } catch (err) {
    return next(err);
  }
};

const createPincode = async (req, res, next) => {
  try {
    const pincode = await Pincode.create(req.body);
    return res.status(201).json({ pincode });
  } catch (err) {
    return next(err);
  }
};

const updatePincode = async (req, res, next) => {
  try {
    const pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pincode) {
      return res.status(404).json({ message: "Pincode not found" });
    }
    return res.status(200).json({ pincode });
  } catch (err) {
    return next(err);
  }
};

const togglePincode = async (req, res, next) => {
  try {
    const pincode = await Pincode.findById(req.params.id);
    if (!pincode) {
      return res.status(404).json({ message: "Pincode not found" });
    }
    pincode.isServiceable = !pincode.isServiceable;
    await pincode.save();
    return res.status(200).json({ pincode });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listPincodes, createPincode, updatePincode, togglePincode };
