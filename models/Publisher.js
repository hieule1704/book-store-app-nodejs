const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema(
  {
    publisherName: { type: String, required: true },
    profileImage: { type: String, default: "No-profile-picture.jpeg" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Publisher", publisherSchema);
