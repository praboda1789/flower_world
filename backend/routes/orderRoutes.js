const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.use(auth); // all routes protected

// User (Customer) routes
router.post('/', orderController.createOrder);            // create order (checkout)
router.get('/me', orderController.getUserOrders);         // get current user's orders
router.get('/:id', orderController.getOrderById);        // get order detail (user or admin)
router.put('/:id', orderController.updateOrder);         // update order (user)
router.post('/:id/cancel', orderController.cancelOrder); // cancel

// Admin routes
router.get('/', orderController.getAllOrdersAdmin);      // admin only - read-only list
router.delete('/:id', orderController.deleteOrderAdmin); // admin only - delete order

module.exports = router;
