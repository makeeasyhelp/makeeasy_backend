const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedDatabase } = require('./utils/seeder');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Seed database with initial data
mongoose.connection.once('open', () => {
  seedDatabase(mongoose);
});

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5050',
  'https://makeeasy-frontend.vercel.app', // Add your Vercel frontend URL
  process.env.FRONTEND_URL, // Optional: Add from environment variable
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'If-Modified-Since', 'If-None-Match'],
  exposedHeaders: ['ETag', 'Last-Modified', 'Cache-Control']
}));

// Configure Helmet with more relaxed settings for development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));

// Add cache control headers to prevent 304 responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// Add detailed request/response logger
app.use((req, res, next) => {
  // Log request details
  console.log(`\n📝 REQUEST: ${req.method} ${req.path}`);
  console.log(`📌 Request headers:`, req.headers.authorization ? { ...req.headers, authorization: 'Bearer [FILTERED]' } : req.headers);
  if (req.body && Object.keys(req.body).length) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[FILTERED]';
    console.log(`📦 Request body:`, sanitizedBody);
  }
  
  // Capture and log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`🔄 RESPONSE: Status ${res.statusCode}`);
    if (data && res.statusCode >= 400) {
      try {
        const parsedData = JSON.parse(data);
        console.log(`❌ Error response:`, parsedData);
      } catch (e) {
        console.log(`❌ Error response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
      }
    }
    originalSend.apply(this, arguments);
  };
  
  next();
});

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Test routes (No auth required - for troubleshooting)
app.use('/api/test', require('./routes/testRoutes'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MakeEasy API' });
});

// Register with role endpoint - simple, direct access endpoint
app.post('/simple-role-register', express.json(), async (req, res) => {
  try {
    console.log('🧪 Simple role register endpoint called with body:', req.body);
    
    const { name, email, password, phone, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "user" or "admin"'
      });
    }
    
    // Import models directly
    const User = mongoose.model('User');
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Create user directly
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user' // Default to 'user' if not provided
    });
    
    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('❌ Simple role register error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test endpoint - completely bypasses all complex middleware
app.post('/api/simple-register', express.json(), async (req, res) => {
  try {
    console.log('🧪 SIMPLE REGISTER TEST ENDPOINT CALLED');
    console.log('Body:', req.body);
    
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }
    
    // Import models directly to avoid middleware
    const User = mongoose.model('User');
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Create user directly
    const user = await User.create({
      name,
      email,
      password,
      phone
    });
    
    // Create token directly
    const token = require('jsonwebtoken').sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    // Remove password
    user.password = undefined;
    
    return res.status(201).json({
      success: true,
      token,
      data: user,
      message: 'Simple register endpoint successful'
    });
    
  } catch (error) {
    console.error('❌ Simple register error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Error handler middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // In production, we'll let the process continue
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;
