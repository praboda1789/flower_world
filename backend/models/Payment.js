const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card', 'cash', 'online'], default: 'card' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  cardDetails: {
    lastFourDigits: { type: String }, // e.g., "1234"
    expiry: { type: String }, // e.g., "12/25"
    cardHolder: { type: String },
    saved: { type: Boolean, default: false } // Whether user chose to save details
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);