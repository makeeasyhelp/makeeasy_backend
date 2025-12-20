const mongoose = require('mongoose');

/**
 * Product Schema - Enhanced for Rental System
 */
const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  // Legacy fields (for backward compatibility with existing products)
  price: {
    type: Number,
    min: [0, 'Price must be at least 0']
  },
  
  location: {
    type: String,
    trim: true
  },
  
  // City-based pricing and availability
  cityPricing: [{
    city: {
      type: String,
      required: true,
      trim: true
    },
    // Tenure-based pricing
    tenures: [{
      months: {
        type: Number,
        required: true,
        min: 1
      },
      monthlyRent: {
        type: Number,
        required: true,
        min: 0
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    deposit: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
    ref: 'Category',
    validate: {
      validator: async function(value) {
        const Category = mongoose.model('Category');
        const count = await Category.countDocuments({ path: value });
        return count > 0;
      },
      message: 'Category does not exist'
    }
  },
  
  // Product Specifications
  specifications: {
    brand: String,
    capacity: String,
    size: String,
    color: String,
    weight: String,
    dimensions: String,
    material: String,
    warranty: String,
    additionalSpecs: mongoose.Schema.Types.Mixed
  },
  
  // Images
  imageUrl: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  
  // Benefits & Features
  benefits: [{
    type: String,
    trim: true
  }],
  
  highlights: [{
    type: String,
    trim: true
  }],
  
  // Rental specific
  minimumTenure: {
    type: Number,
    default: 3, // months
    min: 1
  },
  
  earlyClosureCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Ratings & Reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  available: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with bookings
ProductSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Method to get pricing for specific city
ProductSchema.methods.getCityPricing = function(city) {
  return this.cityPricing.find(cp => cp.city.toLowerCase() === city.toLowerCase());
};

// Method to get tenure pricing
ProductSchema.methods.getTenurePricing = function(city, months) {
  const cityData = this.getCityPricing(city);
  if (!cityData) return null;
  
  return cityData.tenures.find(t => t.months === months) || 
         cityData.tenures.sort((a, b) => Math.abs(a.months - months) - Math.abs(b.months - months))[0];
};

module.exports = mongoose.model('Product', ProductSchema);
