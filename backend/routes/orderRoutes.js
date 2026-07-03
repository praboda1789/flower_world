const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(auth); // all routes protected

// Customer routes
router.post('/', orderController.createOrder);
router.get('/me', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.post('/:id/cancel', orderController.cancelOrder);



// Admin routes
router.get('/admin/orders', admin, orderController.getAllOrdersAdmin);
router.delete('/admin/orders/:id', admin, orderController.deleteOrderAdmin);
router.put('/admin/orders/:id', admin, orderController.updateOrderAdmin);


module.exports = router;
