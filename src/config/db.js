const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Using the MongoDB driver's connection settings
      // Note: useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are 
      // no longer needed in newer mongoose versions (6+)
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
