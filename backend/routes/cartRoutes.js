//cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware'); // your auth middleware

// Protect all routes
router.use(authMiddleware);

router.post('/', cartController.addItemToCart);          // Add item
router.get('/', cartController.getCartItems);            // Get cart items
router.put('/:flowerId', cartController.updateCartItem); // Update quantity
router.delete('/:flowerId', cartController.removeCartItem); // Remove item
router.delete('/', cartController.clearCart);            // Clear entire cart (optional)

module.exports = router;
