const mongoose = require('mongoose');

/**
 * Product Schema
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
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
    ref: 'Category',
    // This will validate that the category exists in the system
    validate: {
      validator: async function(value) {
        const Category = mongoose.model('Category');
        const count = await Category.countDocuments({ path: value });
        return count > 0;
      },
      message: 'Category does not exist'
    }
  },
  imageUrl: {
    type: String,
    default: null
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

module.exports = mongoose.model('Product', ProductSchema);
