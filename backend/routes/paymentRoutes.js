const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, paymentController.createPayment);
router.get('/', auth, paymentController.getUserPayments);
router.get('/saved', auth, paymentController.getSavedCard);
router.put('/:id', auth, paymentController.updatePayment);
router.delete('/saved', auth, paymentController.deleteSavedCard);

module.exports = router;