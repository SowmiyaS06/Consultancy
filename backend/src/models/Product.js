const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, trim: true },
    image: { type: String },
    brand: { type: String, trim: true },
    unit: { type: String, trim: true },
    originalPrice: { type: Number },
    isOffer: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.pre("save", function setStockFlag(next) {
  if (typeof this.stock === "number") {
    this.inStock = this.stock > 0;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
