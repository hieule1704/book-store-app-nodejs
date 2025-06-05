const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String },
    image: { type: String, default: "other_resource/no-picture-book.jpg" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Blog", blogSchema);
