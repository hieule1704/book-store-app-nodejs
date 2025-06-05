const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    profilePicture: { type: String, default: "No-profile-picture.jpeg" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
