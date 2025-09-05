const express = require('express');
const { 
  getAbouts, 
  getAbout, 
  createAbout, 
  updateAbout, 
  deleteAbout 
} = require('../controllers/aboutController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAbouts)
  .post(protect, authorize('admin'), createAbout);

router.route('/:id')
  .get(getAbout)
  .put(protect, authorize('admin'), updateAbout)
  .delete(protect, authorize('admin'), deleteAbout);

module.exports = router;
