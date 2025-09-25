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
    const { flowerId, quantity, size } = req.body;

    if (!flowerId || !quantity || quantity < 1|| !size) {
      return res.status(400).json({ message: 'Invalid flowerId or quantity' });
    }

    // Find flower for price and name
    const flower = await Flower.findById(flowerId);
    if (!flower) {
      return res.status(404).json({ message: 'Flower not found' });
    }

    // Pick correct price based on size
    let price;
    switch (size) {
      case 'small': price = flower.sellingPriceSmall; break;
      case 'medium': price = flower.sellingPriceMedium; break;
      case 'large': price = flower.sellingPriceLarge; break;
      default: return res.status(400).json({ message: 'Invalid size' });
    }


    const cart = await getOrCreateCart(userId);

    // Check if item exists in cart
    const existingItem = cart.items.find(
      item => item.flowerId.equals(flowerId) && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ flowerId, name: flower.name, size, price, quantity });
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

    const cart = await Cart.findOne({ userId }).lean();
    if (!cart) return res.status(200).json({ items: [] }); // empty cart

    const flowerIds = cart.items.map(item => item.flowerId);

    const flowers = await Flower.find({ _id: { $in: flowerIds } })
      .select('image sellingPriceSmall sellingPriceMedium sellingPriceLarge')
      .lean();

    const flowerMap = {};
    flowers.forEach(flower => {
      flowerMap[flower._id.toString()] = flower;
    });

    const itemsWithPrices = cart.items.map(item => {
      const flower = flowerMap[item.flowerId.toString()];
      return {
        ...item,
        image: flower ? `http://localhost:5000/uploads/${flower.image}` : null,
        prices: flower
          ? {
              small: flower.sellingPriceSmall,
              medium: flower.sellingPriceMedium,
              large: flower.sellingPriceLarge,
            }
          : { small: item.price, medium: item.price, large: item.price }, // fallback
        price: item.price, // current price for the selected size
      };
    });

    res.status(200).json({ ...cart, items: itemsWithPrices });
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
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.flowerId.equals(flowerId));
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (quantity && quantity > 0) item.quantity = quantity;

    if (size) {
      const flower = await Flower.findById(flowerId);
      if (!flower) return res.status(404).json({ message: 'Flower not found' });

      item.size = size;
      item.price = size === 'small' ? flower.sellingPriceSmall :
                   size === 'medium' ? flower.sellingPriceMedium :
                   flower.sellingPriceLarge;
    }

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
