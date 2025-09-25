const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: "Flower", required: true },
  name: String,
  size: { type: String, enum: ["small", "medium", "large"], required: true },
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);
