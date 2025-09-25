// routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/authMiddleware'); // Existing auth middleware

router.post('/', auth, deliveryController.createDelivery); // Customer or admin
router.get('/:id', auth, deliveryController.getDeliveryById); // Customer (own) or admin
router.get('/order/:orderId', auth, deliveryController.getDeliveryByOrder); // Customer (own) or admin
router.put('/:id', auth, deliveryController.updateDelivery); // Admin only
router.delete('/:id', auth, deliveryController.deleteDelivery); // Admin only
router.get('/admin/all', auth, deliveryController.getAllDeliveriesAdmin); // Admin only

module.exports = router;