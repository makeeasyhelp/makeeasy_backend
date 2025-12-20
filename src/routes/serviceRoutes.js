const express = require('express');
const { 
  getServices, 
  getService, 
  createService, 
  updateService, 
  deleteService,
  getFeaturedServices,
  uploadServiceImages,
  deleteServiceImage
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategoryImage, uploadServiceImages: uploadMiddleware } = require('../config/multer');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('admin'), uploadCategoryImage.single('image'), createService);

router.route('/featured')
  .get(getFeaturedServices);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('admin'), uploadCategoryImage.single('image'), updateService)
  .delete(protect, authorize('admin'), deleteService);

router.route('/:id/images')
  .post(protect, authorize('admin'), uploadMiddleware.array('images', 5), uploadServiceImages);

router.route('/:id/images/:imageIndex')
  .delete(protect, authorize('admin'), deleteServiceImage);

module.exports = router;
