const mongoose = require('mongoose');

/**
 * Service Schema
 */
const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a service title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Please add an icon name'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
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
ServiceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

module.exports = mongoose.model('Service', ServiceSchema);
