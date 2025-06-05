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
  bookDescription: { type: String },
  tag: { type: String },
  publishYear: { type: Number },
  totalPage: { type: Number },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "no-picture-book.jpg" },
  stockQuantity: { type: Number, default: 100, required: true, min: 0 },
});

module.exports = mongoose.model("Product", productSchema);
