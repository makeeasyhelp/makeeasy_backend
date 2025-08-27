// A script to verify MongoDB connection in a simulated Vercel environment
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

// Simulate Vercel environment
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';
process.env.FORCE_DB_SEED = 'true';
process.env.MONGO_URI = 'mongodb+srv://makeeasyhelp:Make%40easy%40261141@cluster0.7x2dabc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Load models before seeding
require('../src/models/userModel');
require('../src/models/categoryModel');
require('../src/models/productModel');
require('../src/models/serviceModel');

const verifyConnection = async () => {
  console.log('=== VERCEL CONNECTION TEST ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL:', process.env.VERCEL === '1' ? 'Yes' : 'No');
  
  // Mask the MongoDB URI for security
  if (process.env.MONGO_URI) {
    const uriMasked = process.env.MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
    console.log('MongoDB URI:', uriMasked);
  } else {
    console.error('ERROR: MONGO_URI is not defined!');
    process.exit(1);
  }
  
  try {
    console.log('\nAttempting MongoDB connection with retry logic...');
    // Attempt connection with our improved connect function
    const conn = await connectDB();
    
    if (!conn) {
      console.error('Connection failed or returned null');
      process.exit(1);
    }
    
    const isConnected = mongoose.connection && mongoose.connection.readyState === 1;
    
    if (isConnected) {
      console.log(`\n✅ MongoDB Connected Successfully: ${mongoose.connection.host}`);
      console.log(`Database Name: ${mongoose.connection.name}`);
      
      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nAvailable Collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      console.log('\nConnection test successful!');
    } else {
      console.error(`\n❌ MongoDB Connection Failed!`);
      console.log(`Connection state: ${mongoose.connection?.readyState}`);
    }
  } catch (err) {
    console.error(`\n❌ Error testing MongoDB connection: ${err.message}`);
  } finally {
    // Seed database if connection successful
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      console.log('\n🌱 Starting database seeding process...');
      const { seedDatabase } = require('../src/utils/seeder');
      await seedDatabase(mongoose);
    }
    
    // Close the connection
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('Connection closed');
    }
    process.exit(0);
  }
};

verifyConnection();
