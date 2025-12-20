const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  cancelServiceRequest,
  rateServiceRequest,
  getAllServiceRequests,
  assignServiceRequest,
  scheduleVisit,
  markInProgress,
  resolveServiceRequest,
  closeServiceRequest,
  getServiceRequestStats
} = require('../controllers/serviceRequestController');

const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for service request image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/service-requests';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: fileFilter
});

// User routes (protected)
router.post('/', protect, upload.array('images', 5), createServiceRequest);
router.get('/', protect, getServiceRequests);
router.get('/:id', protect, getServiceRequest);
router.put('/:id', protect, upload.array('images', 5), updateServiceRequest);
router.delete('/:id', protect, cancelServiceRequest);
router.post('/:id/rate', protect, rateServiceRequest);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllServiceRequests);
router.get('/admin/stats', protect, authorize('admin'), getServiceRequestStats);
router.post('/admin/:id/assign', protect, authorize('admin'), assignServiceRequest);
router.put('/admin/:id/schedule', protect, authorize('admin'), scheduleVisit);
router.put('/admin/:id/in-progress', protect, authorize('admin'), markInProgress);
router.put('/admin/:id/resolve', protect, authorize('admin'), resolveServiceRequest);
router.put('/admin/:id/close', protect, authorize('admin'), closeServiceRequest);

module.exports = router;
