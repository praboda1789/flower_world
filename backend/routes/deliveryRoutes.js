// routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, deliveryController.createDelivery); // For manual creation if needed, but auto in payment
router.get('/all', auth, deliveryController.getAllDeliveries); // Admin only
router.get('/my', auth, deliveryController.getMyDeliveries); // Customer
router.put('/:id', auth, deliveryController.updateDelivery); // Admin
router.delete('/:id', auth, deliveryController.deleteDelivery); // Admin

module.exports = router;