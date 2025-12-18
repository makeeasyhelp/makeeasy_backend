const express = require('express');
const {
    createOrder,
    getOrders,
    getOrder,
    updateOrder,
    verifyPayment
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All order routes are protected

router.route('/')
    .post(createOrder)
    .get(getOrders);

router.route('/verify-payment')
    .post(verifyPayment);

router.route('/:id')
    .get(getOrder)
    .put(updateOrder);

module.exports = router;
