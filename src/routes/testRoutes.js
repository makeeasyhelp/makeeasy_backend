const express = require('express');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const router = express.Router();

/**
 * @desc    Test register route (no auth)
 * @route   POST /api/test/register
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Test register endpoint called with body:', req.body);
    
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "user" or "admin"'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user' // Default to 'user' if not provided
    });

    // Create token
    console.log('📝 Creating token for user:', { id: user._id, name: user.name });
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    console.error('❌ Error in test register:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @desc    Test login route (no auth)
 * @route   POST /api/test/login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    console.log('📝 Test login endpoint called with body:', req.body);
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    console.log('📝 Creating token for user:', { id: user._id, name: user.name });
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    console.error('❌ Error in test login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @desc    Get all users (no auth)
 * @route   GET /api/test/users
 * @access  Public (FOR TESTING ONLY)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
