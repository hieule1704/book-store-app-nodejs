const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  method: { type: String, required: true },
  address: { type: String, required: true },
  placedOn: { type: String, required: true },
  paymentStatus: { type: String, default: "pending" },
});

module.exports = mongoose.model("Order", orderSchema);
