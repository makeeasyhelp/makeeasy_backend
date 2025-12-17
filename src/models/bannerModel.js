const mongoose = require('mongoose');

/**
 * Banner Schema for Hero Carousel
 */
const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a banner title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Please add a banner image'],
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    default: 'Learn More',
    maxlength: [50, 'Button text cannot be more than 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
BannerSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Banner', BannerSchema);
