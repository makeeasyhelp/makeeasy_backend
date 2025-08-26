// A script to verify database connection and check collection data
require('dotenv').config();
const mongoose = require('mongoose');
const chalk = require('chalk');

const verifyDatabase = async () => {
  console.log(chalk.blue('🔍 Verifying MongoDB connection & data...'));
  
  if (!process.env.MONGO_URI) {
    console.error(chalk.red('❌ Error: MONGO_URI environment variable is not defined'));
    process.exit(1);
  }

  try {
    console.log(chalk.yellow(`Attempting to connect to: ${process.env.MONGO_URI.split('@')[1]}`));
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green(`✅ MongoDB Connected Successfully: ${conn.connection.host}`));
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(chalk.cyan('\n📋 Available Collections:'));
    
    if (collections.length === 0) {
      console.log(chalk.yellow('  No collections found. Database might be empty.'));
    } else {
      collections.forEach(collection => {
        console.log(chalk.white(`  - ${collection.name}`));
      });
    }
    
    // Try to load models and count documents
    console.log(chalk.cyan('\n📊 Collection Statistics:'));
    
    // Load models dynamically
    try {
      require('../src/models/userModel');
      require('../src/models/categoryModel');
      require('../src/models/productModel');
      require('../src/models/serviceModel');
      
      const userCount = await mongoose.model('User').countDocuments();
      const categoryCount = await mongoose.model('Category').countDocuments();
      const productCount = await mongoose.model('Product').countDocuments();
      const serviceCount = await mongoose.model('Service').countDocuments();
      
      console.log(chalk.white(`  - Users: ${userCount} documents`));
      console.log(chalk.white(`  - Categories: ${categoryCount} documents`));
      console.log(chalk.white(`  - Products: ${productCount} documents`));
      console.log(chalk.white(`  - Services: ${serviceCount} documents`));
      
      if (userCount === 0 && categoryCount === 0 && productCount === 0 && serviceCount === 0) {
        console.log(chalk.yellow('\n⚠️  All collections are empty. You may need to seed the database.'));
        console.log(chalk.white('   Run: npm run seed'));
      }
    } catch (err) {
      console.log(chalk.yellow(`\n⚠️  Could not count documents: ${err.message}`));
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log(chalk.blue('\n🔌 Connection closed'));
  } catch (err) {
    console.error(chalk.red(`\n❌ Error connecting to MongoDB: ${err.message}`));
    process.exit(1);
  }
};

// Run the verification
verifyDatabase();
