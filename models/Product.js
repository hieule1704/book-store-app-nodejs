const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher",
    required: true,
  },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  stockQuantity: { type: Number, required: true },
  publishYear: { type: Number },
  totalPage: { type: Number },
  bookDescription: { type: String },
  tag: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
