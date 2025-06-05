const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Message", messageSchema);
