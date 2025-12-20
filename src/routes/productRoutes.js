const express = require('express');
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getFeaturedProducts,
  uploadProductImages,
  deleteProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages: uploadMiddleware } = require('../config/multer');

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/featured')
  .get(getFeaturedProducts);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.route('/:id/images')
  .post(protect, authorize('admin'), uploadMiddleware.array('images', 5), uploadProductImages);

router.route('/:id/images/:imageIndex')
  .delete(protect, authorize('admin'), deleteProductImage);

module.exports = router;
