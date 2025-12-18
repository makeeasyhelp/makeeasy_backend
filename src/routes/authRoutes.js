const express = require('express');
const { 
  register, 
  login, 
  adminLogin,
  logout, 
  getMe, 
  updateDetails, 
  updatePassword, 
  forgotPassword,
  googleAuth,
  uploadProfileImage 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;
