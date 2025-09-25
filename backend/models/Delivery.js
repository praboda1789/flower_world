const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'delivered', 'cancelled'], default: 'pending' },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryPerson: { type: String },
  address: {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Sri Lanka' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);