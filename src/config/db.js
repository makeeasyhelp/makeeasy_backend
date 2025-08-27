const mongoose = require('mongoose');

// Track connection state to avoid multiple connections in serverless environments
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * Connect to MongoDB database
 * Enhanced with better logging, retry logic, and optimized for serverless environments
 */
const connectDB = async () => {
  try {
    // If we're already connected, return the existing connection
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return mongoose;
    }
    
    // Reset connection state if connection is closed or in error state
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      isConnected = false;
    }

    if (!process.env.MONGO_URI) {
      console.error('MongoDB connection error: MONGO_URI environment variable is not defined');
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
      return null;
    }

    // Log connection attempt with URI mask for security
    const uriMasked = process.env.MONGO_URI ? 
      process.env.MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@') : 
      'undefined';
    console.log(`Connecting to MongoDB (Attempt ${++connectionAttempts}): ${uriMasked}`);
    
    // For Vercel serverless function, we need more aggressive connection timeouts
    const isVercel = process.env.VERCEL === '1';
    
    // Check if the MONGO_URI contains proper credentials format (particularly important for Vercel)
    const mongoURI = process.env.MONGO_URI;
    if (!/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/.test(mongoURI)) {
      console.warn('Warning: MongoDB URI might be malformed - check username and password format');
    }
    
    // Log connection options for debugging
    console.log('MongoDB connection options:', {
      isVercel,
      serverSelectionTimeoutMS: isVercel ? 3000 : 5000,
      connectTimeoutMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const conn = await mongoose.connect(mongoURI, {
      // Serverless-friendly options
      serverSelectionTimeoutMS: isVercel ? 3000 : 5000, // Lower timeout for Vercel
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      // Add these options for better connection handling
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });

    isConnected = true;
    connectionAttempts = 0; // Reset attempts on success
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Return the connection for use in other parts of the application
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB (Attempt ${connectionAttempts}): ${err.message}`);
    
    // Retry connection if we haven't exceeded max attempts
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`Retrying connection, attempt ${connectionAttempts+1} of ${MAX_RETRIES}...`);
      return connectDB(); // Recursive retry
    }
    
    // In production, log the error but don't exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed after retries, but keeping the application running.');
      return null;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
