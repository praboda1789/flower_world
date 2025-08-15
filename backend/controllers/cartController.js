//cartController.js
const Cart = require('../models/Cart');
const Flower = require('../models/flower'); 

// Helper: Get or create cart for a user
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }
  return cart;
}

// Add or update item in cart
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { flowerId, quantity } = req.body;

    if (!flowerId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid flowerId or quantity' });
    }

    // Find flower for price and name
    const flower = await Flower.findById(flowerId);
    if (!flower) {
      return res.status(404).json({ message: 'Flower not found' });
    }

    const cart = await getOrCreateCart(userId);

    // Check if item exists in cart
    const existingItem = cart.items.find(item => item.flowerId.equals(flowerId));

    if (existingItem) {
      existingItem.quantity += quantity; // Increase quantity
    } else {
      cart.items.push({
        flowerId,
        name: flower.name,
        price: flower.buyPrice,
        quantity
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all items in cart
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId }).lean();
    if (!cart) {
      return res.status(200).json({ items: [] }); // empty cart
    }

    // Get flower IDs in the cart
    const flowerIds = cart.items.map(item => item.flowerId);

    // Fetch flower info for all flowers in the cart
    const flowers = await Flower.find({ _id: { $in: flowerIds } })
      .select('image') // select only image (you can add name/price if needed)
      .lean();

    // Create a map flowerId => image
    const flowerImageMap = {};
    flowers.forEach(flower => {
      flowerImageMap[flower._id.toString()] = flower.image;
    });

    // Add image to each cart item by matching flowerId
    const itemsWithImages = cart.items.map(item => ({
    ...item,
    image: flowerImageMap[item.flowerId.toString()]
        ? `http://localhost:5000/uploads/${flowerImageMap[item.flowerId.toString()]}`
        : null
    }));

    // Return cart with items including image field
    res.status(200).json({ ...cart, items: itemsWithImages });

  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flowerId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.flowerId.equals(flowerId));
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { flowerId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => !item.flowerId.equals(flowerId));
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional: Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};
