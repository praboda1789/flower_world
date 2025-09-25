// controllers/deliveryController.js
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

exports.createDelivery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, estimatedDeliveryDate } = req.body;

    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order not eligible for delivery creation' });
    }

    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) return res.status(400).json({ message: 'Delivery already created for this order' });

    // Create delivery with default pending status
    const delivery = await Delivery.create({
      orderId,
      estimatedDeliveryDate: estimatedDeliveryDate || order.deliveryDate,
      deliveryAddress: {
        addressLine: order.addressLine,
        city: order.city,
        district: order.district,
        postalCode: order.postalCode,
        country: order.country
      },
      deliveryStatus: 'pending',
      courierService: 'Local Courier' // Default, admin can update later
    });

    // Update order status to 'confirmed' using existing update logic
    await Order.findByIdAndUpdate(orderId, { status: 'confirmed' });

    res.status(201).json({ delivery });
  } catch (err) {
    console.error('Create delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('orderId', 'userId status');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Permission: Admin or order owner
    if (!req.user.isAdmin && delivery.orderId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json({ delivery });
  } catch (err) {
    console.error('Get delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDeliveryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const delivery = await Delivery.findOne({ orderId }).populate('orderId', 'userId status');
    if (!delivery) return res.status(404).json({ message: 'No delivery found for this order' });

    // Permission: Admin or order owner
    if (!req.user.isAdmin && delivery.orderId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json({ delivery });
  } catch (err) {
    console.error('Get delivery by order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    const { trackingNumber, courierService, deliveryStatus, estimatedDeliveryDate, actualDeliveryDate, deliveryNotes } = req.body;
    if (trackingNumber) delivery.trackingNumber = trackingNumber;
    if (courierService) delivery.courierService = courierService;
    if (deliveryStatus) delivery.deliveryStatus = deliveryStatus;
    if (estimatedDeliveryDate) delivery.estimatedDeliveryDate = estimatedDeliveryDate;
    if (actualDeliveryDate) delivery.actualDeliveryDate = actualDeliveryDate;
    if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;

    await delivery.save();

    // Sync order status without modifying Order schema
    let orderUpdate = {};
    if (delivery.deliveryStatus === 'dispatched' || delivery.deliveryStatus === 'out for delivery') {
      orderUpdate.status = 'dispatched';
    } else if (delivery.deliveryStatus === 'delivered') {
      orderUpdate.status = 'delivered';
    } else if (delivery.deliveryStatus === 'failed' || delivery.deliveryStatus === 'returned') {
      orderUpdate.status = 'cancelled';
    }
    if (Object.keys(orderUpdate).length > 0) {
      await Order.findByIdAndUpdate(delivery.orderId, orderUpdate);
    }

    res.status(200).json({ delivery });
  } catch (err) {
    console.error('Update delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    await delivery.remove();
    // Optional: Reset order status to 'confirmed'
    await Order.findByIdAndUpdate(delivery.orderId, { status: 'confirmed' });

    res.status(200).json({ message: 'Delivery deleted' });
  } catch (err) {
    console.error('Delete delivery error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllDeliveriesAdmin = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
    const deliveries = await Delivery.find().sort({ createdAt: -1 }).populate('orderId', 'total status userId');
    res.status(200).json({ deliveries });
  } catch (err) {
    console.error('Get all deliveries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};