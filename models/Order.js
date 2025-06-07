const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true },
  method: { type: String, required: true },
  address: { type: String, required: true },
  totalProducts: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  placedOn: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed'] },
});

module.exports = mongoose.model("Order", orderSchema);
