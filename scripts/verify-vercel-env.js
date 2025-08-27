// Script to verify Vercel environment variables
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('=== VERCEL ENVIRONMENT VARIABLE VERIFICATION ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

// Check for essential variables
const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];

let allPresent = true;
for (const varName of requiredVars) {
  if (process.env[varName]) {
    // Mask sensitive data when printing
    let value = process.env[varName];
    if (varName.includes('URI') || varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD')) {
      value = value.substring(0, 3) + '...' + value.substring(value.length - 3);
    }
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allPresent = false;
  }
}

if (allPresent) {
  console.log('\n🟢 All required environment variables are set!');
} else {
  console.log('\n🔴 Some required environment variables are missing!');
  console.log('Make sure to add them to your Vercel project settings.');
}

// Additional environment info
console.log('\nAdditional Information:');
console.log('VERCEL:', process.env.VERCEL ? 'Yes' : 'No');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'Not set');
console.log('VERCEL_REGION:', process.env.VERCEL_REGION || 'Not set');
