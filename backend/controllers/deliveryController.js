// controllers/deliveryController.js
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Create a new delivery (automatically called after payment)
exports.createDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid orderId' });
    }

    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const delivery = await Delivery.create({
      orderId,
      userId,
      status: 'pending',
      estimatedDeliveryDate: order.deliveryDate || null, // From order
      actualDeliveryDate: null,
      deliveryPerson: '', // Default empty
      address: {
        addressLine: order.addressLine,
        city: order.city,
        district: order.district,
        postalCode: order.postalCode,
        country: order.country
      }
    });

    res.status(201).json({ delivery });
  } catch (err) {
    console.error('Create delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all deliveries (admin only)
exports.getAllDeliveries = async (req, res) => {
  try {
    

    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.createdAt = { $gte: new Date(date) }; // Example filter by date

    const deliveries = await Delivery.find(filter)
      .populate('orderId', 'total status')
      .populate('userId', 'name email')
      .lean();

    res.status(200).json({ deliveries });
  } catch (err) {
    console.error('Get all deliveries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's deliveries (customer view)
exports.getMyDeliveries = async (req, res) => {
  try {
    const userId = req.user._id;
    const deliveries = await Delivery.find({ userId })
      .populate('orderId', 'total status')
      .lean();

    res.status(200).json({ deliveries });
  } catch (err) {
    console.error('Get my deliveries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery
exports.updateDelivery = async (req, res) => {
  try {
    

    const { id } = req.params;
    const { status, deliveryPerson, estimatedDeliveryDate, actualDeliveryDate, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid delivery ID' });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    if (status) delivery.status = status;
    if (deliveryPerson) delivery.deliveryPerson = deliveryPerson;
    if (estimatedDeliveryDate) delivery.estimatedDeliveryDate = estimatedDeliveryDate;
    if (actualDeliveryDate) delivery.actualDeliveryDate = actualDeliveryDate;
    if (address) delivery.address = { ...delivery.address, ...address };

    await delivery.save();

    res.status(200).json({ delivery });
  } catch (err) {
    console.error('Update delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
  try {
    

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid delivery ID' });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    if (!['cancelled', 'invalid'].includes(delivery.status)) {
      return res.status(400).json({ message: 'Can only delete cancelled or invalid deliveries' });
    }

    await delivery.remove();

    res.status(200).json({ message: 'Delivery deleted' });
  } catch (err) {
    console.error('Delete delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};