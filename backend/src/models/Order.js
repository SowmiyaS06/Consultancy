const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    customerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["placed", "delivered", "cancelled"],
      default: "placed",
    },
    paymentMethod: { type: String, trim: true },
    paymentStatus: { type: String, trim: true, default: "pending" },
    razorpayPaymentId: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
