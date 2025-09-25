const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const Delivery = require('../models/Delivery');

exports.createPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, amount, method, cardDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid orderId' });
    }

    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== userId.toString() || !order.total) {
      return res.status(403).json({ message: 'Invalid order or unauthorized' });
    }

    if (amount !== order.total) {
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    const payment = await Payment.create({
      orderId,
      userId,
      amount,
      method: method || 'card',
      status: 'completed', // Demo payment is always completed
      transactionId: `TXN-${Date.now()}`,
      cardDetails: cardDetails || {}
    });

    // Automatically create delivery after payment
    const delivery = await Delivery.create({
      orderId,
      userId,
      status: 'pending',
      estimatedDeliveryDate: order.deliveryDate || null,
      actualDeliveryDate: null,
      deliveryPerson: '',
      address: {
        addressLine: order.addressLine,
        city: order.city,
        district: order.district || '',
        postalCode: order.postalCode || '',
        country: order.country
      }
    });

    res.status(201).json({ payment, delivery });
  } catch (err) {
    console.error('Create payment error:', {
      message: err.message,
      stack: err.stack,
      payload: req.body
    });
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId })
      .populate('orderId', 'total status')
      .select('-cardDetails') // Exclude sensitive cardDetails
      .lean();
    res.status(200).json({ payments });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSavedCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const payment = await Payment.findOne({ userId, 'cardDetails.saved': true })
      .select('cardDetails')
      .lean();
    res.status(200).json({ card: payment?.cardDetails || null });
  } catch (err) {
    console.error('Get saved card error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { cardDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findOne({ _id: id, userId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or unauthorized' });
    }

    if (cardDetails) {
      payment.cardDetails = { ...payment.cardDetails, ...cardDetails };
      await payment.save();
    } else {
      return res.status(400).json({ message: 'No card details provided' });
    }

    res.status(200).json({ payment });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSavedCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const payment = await Payment.findOne({ userId, 'cardDetails.saved': true });
    if (!payment) {
      return res.status(404).json({ message: 'No saved card found' });
    }

    payment.cardDetails = {};
    await payment.save();

    res.status(200).json({ message: 'Saved card removed' });
  } catch (err) {
    console.error('Delete saved card error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};