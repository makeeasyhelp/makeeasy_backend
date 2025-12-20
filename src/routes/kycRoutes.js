const express = require('express');
const router = express.Router();
const {
  submitKYC,
  getKYCStatus,
  updateKYC,
  getAllKYCSubmissions,
  getKYCDetails,
  verifyKYC,
  rejectKYC,
  markUnderReview,
  getKYCStats
} = require('../controllers/kycController');

const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for KYC document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/kyc';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'kyc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs only
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// User routes (protected)
router.post('/', protect, upload.fields([
  { name: 'idProofDocument', maxCount: 1 },
  { name: 'addressProofDocument', maxCount: 1 }
]), submitKYC);

router.get('/', protect, getKYCStatus);

router.put('/', protect, upload.fields([
  { name: 'idProofDocument', maxCount: 1 },
  { name: 'addressProofDocument', maxCount: 1 }
]), updateKYC);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllKYCSubmissions);
router.get('/admin/stats', protect, authorize('admin'), getKYCStats);
router.get('/admin/:id', protect, authorize('admin'), getKYCDetails);
router.post('/admin/:id/verify', protect, authorize('admin'), verifyKYC);
router.post('/admin/:id/reject', protect, authorize('admin'), rejectKYC);
router.put('/admin/:id/review', protect, authorize('admin'), markUnderReview);

module.exports = router;
