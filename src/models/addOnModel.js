const mongoose = require('mongoose');

/**
 * Add-on Schema - Damage protection, insurance, accessories
 */
const AddOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['damage_protection', 'insurance', 'accessory', 'service_plan'],
    required: true
  },
  
  // Monthly charge
  monthlyCharge: {
    type: Number,
    required: true,
    min: 0
  },
  
  // One-time charge
  oneTimeCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Coverage details
  coverage: {
    type: String,
    trim: true
  },
  
  // What's covered
  inclusions: [String],
  
  // What's not covered
  exclusions: [String],
  
  // Maximum coverage amount
  maxCoverageAmount: {
    type: Number
  },
  
  // Terms & Conditions
  terms: {
    type: String,
    trim: true
  },
  
  // Icon/Image
  imageUrl: {
    type: String
  },
  
  // Active status
  active: {
    type: Boolean,
    default: true
  },
  
  // Display order
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Applicable to which product categories
  applicableCategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }]
}, {
  timestamps: true
});

// Index for active add-ons
AddOnSchema.index({ active: 1, displayOrder: 1 });

module.exports = mongoose.model('AddOn', AddOnSchema);
