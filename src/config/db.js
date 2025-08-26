const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Enhanced with better logging for production environments
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MongoDB connection error: MONGO_URI environment variable is not defined');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Using the MongoDB driver's connection settings
      // Note: useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are 
      // no longer needed in newer mongoose versions (6+)
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Return the connection for use in other parts of the application
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    // In production, log the error but don't exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed, but keeping the application running.');
      return null;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
