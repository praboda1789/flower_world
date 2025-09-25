// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower', required: true },
  name: String,
  size: { type: String, enum: ['small','medium','large'] },
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },

  // Sender and receiver
  fromName: { type: String, required: true },
  toName: { type: String, required: true },
  message: { type: String }, // love sentence optional
  phone: { type: String, required: true },

  // Address - split into fields for validation
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String },
  postalCode: { type: String },
  country: { type: String, required: true, default: 'Sri Lanka' },

  // Delivery & status
  deliveryDate: { type: Date },
  paymentMethod: { type: String, enum: ['cash','card','online'], default: 'cash' },
  status: { type: String, enum: ['pending','confirmed','processing','dispatched','delivered','cancelled'], default: 'pending' },

  notes: String, // admin notes if needed
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
