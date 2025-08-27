const mongoose = require('mongoose');
require('dotenv').config();

const testDBConnection = async () => {
  console.log('🔍 Testing MongoDB connection...');
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  
  // Mask the MongoDB URI for security but show part of it for verification
  const uriMasked = process.env.MONGO_URI ? 
    process.env.MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@') : 
    'undefined';
  console.log('🔗 MongoDB URI:', uriMasked);
  
  if (!process.env.MONGO_URI) {
    console.error('❌ Error: MONGO_URI environment variable is not defined');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    
    // Timeout after 10 seconds
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each model if they exist
    try {
      if (mongoose.modelNames().includes('User')) {
        const userCount = await mongoose.model('User').countDocuments();
        console.log(`Users: ${userCount} documents`);
      }
      
      if (mongoose.modelNames().includes('Category')) {
        const categoryCount = await mongoose.model('Category').countDocuments();
        console.log(`Categories: ${categoryCount} documents`);
      }
      
      if (mongoose.modelNames().includes('Product')) {
        const productCount = await mongoose.model('Product').countDocuments();
        console.log(`Products: ${productCount} documents`);
      }
      
      if (mongoose.modelNames().includes('Service')) {
        const serviceCount = await mongoose.model('Service').countDocuments();
        console.log(`Services: ${serviceCount} documents`);
      }
    } catch (err) {
      console.log('Note: Could not count documents, models may not be defined yet');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Run the test
testDBConnection();
