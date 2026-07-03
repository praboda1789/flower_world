// controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Flower = require('../models/flower');
const ensureSriLanka = require('../middleware/checkSriLanka');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromName, toName, message, phone, addressLine, city, district, postalCode, country, deliveryDate, paymentMethod, items, total } = req.body;

    // Basic validation
    if (!fromName || !toName || !phone || !addressLine || !city || !country) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Get cart items if not provided in payload
    let orderItems = items;
    let calculatedTotal = total;
    if (!orderItems || !calculatedTotal) {
      const cart = await Cart.findOne({ userId }).lean();
      if (!cart || !cart.items.length) {
        return res.status(400).json({ message: 'Cart is empty.' });
      }

      // Build order items with latest price and name to avoid price tampering
      const flowerIds = cart.items.map(i => i.flowerId);
      const flowers = await Flower.find({ _id: { $in: flowerIds } }).lean();
      const flowerMap = {};
      flowers.forEach(f => { flowerMap[f._id.toString()] = f; });

      orderItems = cart.items.map(i => {
        const f = flowerMap[i.flowerId.toString()] || {};
        return {
          flowerId: i.flowerId,
          name: f.name || i.name,
          size: i.size,
          price: i.price || (i.size === 'small' ? f.sellingPriceSmall : i.size === 'medium' ? f.sellingPriceMedium : f.sellingPriceLarge),
          quantity: i.quantity,
          image: f.image || i.image
        };
      });

      calculatedTotal = orderItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
    }

    const orderData = {
      userId,
      items: orderItems,
      total: calculatedTotal,
      fromName,
      toName,
      message,
      phone,
      addressLine,
      city,
      district: district || '',
      postalCode: postalCode || '',
      country,
      deliveryDate: deliveryDate || null,
      paymentMethod: paymentMethod || 'card', // Default to 'card' since payment is confirmed
      status: 'confirmed' // Set to confirmed since payment is done
    };

    // Sri Lanka rule
    const isSriLanka = ensureSriLanka({ country });
    if (!isSriLanka) {
      orderData.status = 'cancelled';
      const order = await Order.create(orderData);
      return res.status(200).json({ order, warning: 'We sell flowers in Sri Lanka only. Your order has been marked as cancelled.' });
    }

    // Create order
    const order = await Order.create(orderData);

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json({ order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.user.isAdmin && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Forbidden' });

    // Allow update only if order is still pending or cancelled
    if (!['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot update order after it is processed.' });
    }

    const allowed = ['fromName', 'toName', 'message', 'phone', 'addressLine', 'city', 'district', 'postalCode', 'country', 'deliveryDate', 'paymentMethod'];
    allowed.forEach(k => { if (req.body[k] !== undefined) order[k] = req.body[k]; });

    // If country changed -> check Sri Lanka rule
    const isSriLanka = ensureSriLanka({ country: order.country });
    if (!isSriLanka) order.status = 'cancelled';
    else if (order.status === 'cancelled') order.status = 'pending';

    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Forbidden' });
    if (['dispatched', 'delivered'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel at this stage' });

    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Order.deleteOne({ _id: req.params.id });
    // Or: await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Order deleted' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    const allowed = ['status', 'fromName', 'toName', 'message', 'phone', 'addressLine', 'city', 'district', 'postalCode', 'country', 'deliveryDate', 'paymentMethod'];
    allowed.forEach(k => { if (req.body[k] !== undefined) order[k] = req.body[k]; });

    await order.save();
    res.status(200).json({ order });
  } catch (err) {
    console.error('Admin update order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
