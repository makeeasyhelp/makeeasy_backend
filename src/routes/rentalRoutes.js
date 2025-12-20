const express = require('express');
const router = express.Router();
const {
  createRental,
  getRentals,
  getRental,
  requestExtension,
  requestEarlyClosure,
  pauseRental,
  resumeRental,
  getAllRentals,
  updateRentalStatus,
  scheduleDelivery,
  schedulePickup,
  approveExtension
} = require('../controllers/rentalController');

const { protect, authorize } = require('../middleware/auth');

// User routes (protected)
router.post('/', protect, createRental);
router.get('/', protect, getRentals);
router.get('/:id', protect, getRental);
router.post('/:id/extend', protect, requestExtension);
router.post('/:id/early-closure', protect, requestEarlyClosure);
router.put('/:id/pause', protect, pauseRental);
router.put('/:id/resume', protect, resumeRental);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllRentals);
router.put('/admin/:id/status', protect, authorize('admin'), updateRentalStatus);
router.put('/admin/:id/schedule-delivery', protect, authorize('admin'), scheduleDelivery);
router.put('/admin/:id/schedule-pickup', protect, authorize('admin'), schedulePickup);
router.put('/admin/:id/approve-extension/:requestIndex', protect, authorize('admin'), approveExtension);

module.exports = router;
