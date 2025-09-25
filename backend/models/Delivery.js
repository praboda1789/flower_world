// models/delivery.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  trackingNumber: { type: String, unique: true, sparse: true }, // Sparse for optional tracking
  courierService: { type: String, enum: ['Local Courier', 'DHL', 'UPS', 'FedEx', 'Other'], default: 'Local Courier' },
  deliveryStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'dispatched', 'out for delivery', 'delivered', 'failed', 'returned'], 
    default: 'pending' 
  },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  deliveryNotes: { type: String },
  deliveryAddress: {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true, default: 'Sri Lanka' }
  }
}, { timestamps: true });

deliverySchema.index({ orderId: 1 });
deliverySchema.index({ trackingNumber: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);