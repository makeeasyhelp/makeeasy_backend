const express = require('express');
const { 
  getServices, 
  getService, 
  createService, 
  updateService, 
  deleteService,
  getFeaturedServices
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/multer');

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

module.exports = router;
