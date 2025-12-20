const express = require('express');
const { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/multer');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), uploadCategoryImage.single('image'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(protect, authorize('admin'), uploadCategoryImage.single('image'), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
