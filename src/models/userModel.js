const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth provider
      return !this.authProvider || this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String, // Store the provider's user ID (e.g., Firebase UID)
    sparse: true
  },
  photoURL: {
    type: String // Profile picture URL from OAuth provider
  },
  profileImage: {
    type: String // User's custom profile image URL
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
    default: ''
  },
  address: {
    type: String,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  // Only run this if password was modified and password exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is missing or undefined!');
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    
    const token = jwt.sign(
      { id: this._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    return token;
  } catch (error) {
    console.error('❌ Error signing JWT token:', error.message);
    throw error;
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
