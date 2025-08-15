//Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [cartItemSchema]
});

module.exports = mongoose.model('Cart', cartSchema);
