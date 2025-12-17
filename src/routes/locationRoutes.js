const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', locationController.getActiveLocations);
router.get('/states', locationController.getStates);
router.get('/state/:state', locationController.getLocationsByState);

// Admin routes
router.get('/all', protect, authorize('admin'), locationController.getAllLocations);
router.get('/:id', protect, authorize('admin'), locationController.getLocationById);
router.post('/', protect, authorize('admin'), locationController.createLocation);
router.put('/:id', protect, authorize('admin'), locationController.updateLocation);
router.delete('/:id', protect, authorize('admin'), locationController.deleteLocation);
router.patch('/:id/toggle', protect, authorize('admin'), locationController.toggleLocationStatus);

module.exports = router;
