const express = require('express');
const { 
  getBookings, 
  getBooking, 
  createBooking, 
  updateBooking, 
  deleteBooking,
  updatePaymentStatus,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

router.route('/:id/payment')
  .put(protect, authorize('admin'), updatePaymentStatus);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateBookingStatus);

module.exports = router;
