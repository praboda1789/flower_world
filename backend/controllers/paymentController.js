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
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (amount !== order.total) {
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    let payment;
    if (cardDetails?.saved) {
      if (!cardDetails.lastFourDigits || !cardDetails.expiry || !cardDetails.cardHolder) {
        return res.status(400).json({ 
          message: 'Invalid card details provided',
          details: {
            lastFourDigits: !!cardDetails?.lastFourDigits,
            expiry: !!cardDetails?.expiry,
            cardHolder: !!cardDetails?.cardHolder
          }
        });
      }
      const [month, year] = cardDetails.expiry.split('/');
      const expiryDate = new Date(`20${year}`, month - 1);
      const today = new Date();
      if (expiryDate <= today) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
      const existingPayment = await Payment.findOne({
        userId,
        'cardDetails.lastFourDigits': cardDetails.lastFourDigits,
        'cardDetails.expiry': cardDetails.expiry,
        'cardDetails.cardHolder': cardDetails.cardHolder,
        'cardDetails.saved': true
      });

      if (existingPayment) {
        existingPayment.orderId = orderId;
        existingPayment.amount = amount;
        existingPayment.method = method || 'card';
        existingPayment.status = 'completed';
        existingPayment.transactionId = `TXN-${Date.now()}`;
        existingPayment.cardDetails = cardDetails;
        await existingPayment.save();
        payment = existingPayment;
      } else {
        payment = await Payment.create({
          orderId,
          userId,
          amount,
          method: method || 'card',
          status: 'completed',
          transactionId: `TXN-${Date.now()}`,
          cardDetails: { ...cardDetails, saved: true }
        });
      }
    } else {
      payment = await Payment.create({
        orderId,
        userId,
        amount,
        method: method || 'card',
        status: 'completed',
        transactionId: `TXN-${Date.now()}`,
        cardDetails: cardDetails || { saved: false }
      });
    }

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
      .select('orderId userId amount method status transactionId cardDetails')
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
    const payments = await Payment.find({ userId, 'cardDetails.saved': true })
      .select('cardDetails _id')
      .lean();
    res.status(200).json({ cards: payments.map(p => ({ ...p.cardDetails, paymentId: p._id })) });
  } catch (err) {
    console.error('Get saved cards error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { cardDetails } = req.body;

    console.log('Received update request:', { id, userId, body: req.body });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findOne({ _id: id, userId, 'cardDetails.saved': true });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or unauthorized' });
    }

    if (!cardDetails || typeof cardDetails !== 'object') {
      return res.status(400).json({ 
        message: 'Invalid or missing cardDetails object',
        details: { cardDetails: !!cardDetails }
      });
    }

    if (!cardDetails.lastFourDigits || !cardDetails.expiry || !cardDetails.cardHolder) {
      return res.status(400).json({ 
        message: 'Invalid or incomplete card details provided',
        details: {
          lastFourDigits: !!cardDetails.lastFourDigits,
          expiry: !!cardDetails.expiry,
          cardHolder: !!cardDetails.cardHolder
        }
      });
    }

    const [month, year] = cardDetails.expiry.split('/');
    if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) {
      return res.status(400).json({ message: 'Invalid expiry format (MM/YY required)' });
    }
    const expiryDate = new Date(`20${year}`, month - 1);
    const today = new Date();
    if (isNaN(expiryDate.getTime()) || expiryDate <= today) {
      return res.status(400).json({ message: 'Expiry date must be a valid date in the future' });
    }

    const existingPayment = await Payment.findOne({
      userId,
      'cardDetails.lastFourDigits': cardDetails.lastFourDigits,
      'cardDetails.expiry': cardDetails.expiry,
      'cardDetails.cardHolder': cardDetails.cardHolder,
      'cardDetails.saved': true,
      _id: { $ne: id }
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'This card is already saved.' });
    }

    console.log('Updating payment with cardDetails:', cardDetails);
    payment.cardDetails = { ...cardDetails, saved: true };
    await payment.save();

    res.status(200).json({ payment });
  } catch (err) {
    console.error('Update payment error:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.deleteSavedCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const payment = await Payment.findOne({ _id: id, userId, 'cardDetails.saved': true });
    if (!payment) {
      return res.status(404).json({ message: 'No saved card found or unauthorized' });
    }

    payment.cardDetails = { saved: false, lastFourDigits: '', expiry: '', cardHolder: '' };
    await payment.save();

    res.status(200).json({ message: 'Saved card removed' });
  } catch (err) {
    console.error('Delete saved card error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};