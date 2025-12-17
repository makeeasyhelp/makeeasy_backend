const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', bannerController.getActiveBanners);

// Admin routes
router.get('/all', protect, authorize('admin'), bannerController.getAllBanners);
router.get('/:id', protect, authorize('admin'), bannerController.getBannerById);
router.post('/', protect, authorize('admin'), bannerController.createBanner);
router.put('/:id', protect, authorize('admin'), bannerController.updateBanner);
router.delete('/:id', protect, authorize('admin'), bannerController.deleteBanner);
router.patch('/:id/toggle', protect, authorize('admin'), bannerController.toggleBannerStatus);
router.put('/reorder/batch', protect, authorize('admin'), bannerController.updateBannerOrder);

module.exports = router;
