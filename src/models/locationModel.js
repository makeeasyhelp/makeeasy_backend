const mongoose = require('mongoose');

/**
 * Location Schema for City/District Management
 */
const LocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'Please add a city name'],
    trim: true,
    maxlength: [100, 'City name cannot be more than 100 characters']
  },
  district: {
    type: String,
    required: [true, 'Please add a district name'],
    trim: true,
    maxlength: [100, 'District name cannot be more than 100 characters']
  },
  state: {
    type: String,
    required: [true, 'Please add a state name'],
    trim: true,
    maxlength: [100, 'State name cannot be more than 100 characters']
  },
  icon: {
    type: String,
    trim: true,
    default: 'MapPin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isNew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
LocationSchema.index({ isActive: 1, displayOrder: 1 });
LocationSchema.index({ city: 1 });
LocationSchema.index({ state: 1 });

module.exports = mongoose.model('Location', LocationSchema);
