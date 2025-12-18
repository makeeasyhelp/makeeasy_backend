const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
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

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
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

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for admin user
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials'
      });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      address: req.body.address,
      profileImage: req.body.profileImage
    };

    // Only include fields that were actually provided
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Convert dateOfBirth string to Date if provided
    if (fieldsToUpdate.dateOfBirth) {
      fieldsToUpdate.dateOfBirth = new Date(fieldsToUpdate.dateOfBirth);
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile image
 * @route   POST /api/auth/upload-profile-image
 * @access  Private
 */
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Construct the image URL
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user's profileImage field
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        profileImage: imageUrl,
        user: user
      }
    });
  } catch (error) {
    // Delete uploaded file if database update fails
    if (req.file) {
      const fs = require('fs');
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user with that email'
      });
    }

    // In a production app, we would send an email with a reset token
    // For this demo, we'll just return a success message
    
    res.status(200).json({
      success: true,
      data: 'Password reset functionality would send an email here'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { name, email, providerId, photoURL } = req.body;

    // Validate required fields
    if (!email || !providerId) {
      return res.status(400).json({
        success: false,
        error: 'Email and provider ID are required'
      });
    }

    // Check if user already exists (by email or providerId)
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { providerId: providerId, authProvider: 'google' }
      ]
    });

    if (user) {
      // User exists - update their info if needed
      if (!user.providerId || !user.authProvider) {
        user.providerId = providerId;
        user.authProvider = 'google';
      }
      if (photoURL && !user.photoURL) {
        user.photoURL = photoURL;
      }
      if (name && !user.name) {
        user.name = name;
      }
      await user.save();
    } else {
      // Create new user with Google OAuth
      user = await User.create({
        name: name || email.split('@')[0], // Use part of email as name if not provided
        email,
        authProvider: 'google',
        providerId,
        photoURL,
        role: 'user'
      });
    }

    // Check if profile is complete
    const isProfileComplete = !!(user.email && user.phone && user.password);

    // Send token response with profile completion status
    const token = user.getSignedJwtToken();
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: user,
      isProfileComplete
    });
  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

/**
 * Get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  console.log('📝 Creating token for user:', { id: user._id, name: user.name, role: user.role });
  console.log('🔑 Using JWT secret:', process.env.JWT_SECRET);
  const token = user.getSignedJwtToken();
  console.log('🎟️ Token created successfully');

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: user
  });
};
